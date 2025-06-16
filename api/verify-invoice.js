// api/verify-invoice.js - Fixed Vercel Serverless Function
// No Express, no external dependencies, just pure Node.js

// Helper function to parse JSON body - HANDLES CHAINLINK FUNCTIONS FORMAT
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        console.log('Raw body received:', body);
        console.log('Body type:', typeof body);
        console.log('Body length:', body.length);
        
        if (!body || body.trim() === '') {
          resolve({});
          return;
        }
        
        let parsedBody;
        
        // First, try normal JSON parsing
        try {
          parsedBody = JSON.parse(body);
          console.log('First parse successful:', parsedBody);
          console.log('Parsed body type:', typeof parsedBody);
          
          // Check if the parsed result is a string (which would be double-encoded JSON)
          if (typeof parsedBody === 'string') {
            console.log('Parsed body is a string, attempting second parse...');
            try {
              const secondParse = JSON.parse(parsedBody);
              console.log('Second parse successful:', secondParse);
              parsedBody = secondParse;
            } catch (secondError) {
              console.log('Second parse failed, keeping first parse result');
              // Keep the first parse result
            }
          }
          
        } catch (firstError) {
          console.log('First JSON parse failed:', firstError.message);
          throw firstError;
        }
        
        resolve(parsedBody);
      } catch (error) {
        console.error('Error parsing body:', error);
        reject(new Error('Invalid JSON: ' + error.message));
      }
    });
    req.on('error', reject);
  });
}

// Alternative simpler parseBody function
async function parseBodySimple(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        console.log('Raw body received:', body);
        
        if (!body || body.trim() === '') {
          resolve({});
          return;
        }
        
        // Simply parse once
        const parsedBody = JSON.parse(body);
        console.log('Parsed body:', parsedBody);
        resolve(parsedBody);
      } catch (error) {
        console.error('JSON parse error:', error);
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Helper function to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, User-Agent');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Content-Type', 'application/json');
}

// Helper function to normalize invoice ID
function normalizeInvoiceId(invoiceId) {
  if (invoiceId === null || invoiceId === undefined || invoiceId === '') {
    return null;
  }
  
  const idStr = String(invoiceId).trim();
  
  if (idStr === '0') {
    return '0';
  }
  
  const normalizedId = idStr.replace(/^0+/, '') || '0';
  
  console.log(`Normalizing ID: "${invoiceId}" (${typeof invoiceId}) -> "${normalizedId}"`);
  return normalizedId;
}

// Invoice verification logic
async function verifyInvoiceLogic(invoiceId) {
  try {
    console.log('\n--- VERIFICATION LOGIC START ---');
    console.log(`Input - InvoiceId: ${invoiceId} (type: ${typeof invoiceId})`);
    
    const normalizedId = normalizeInvoiceId(invoiceId);
    
    if (normalizedId === null) {
      console.log('❌ Invalid invoice ID provided');
      return false;
    }
    
    console.log(`Normalized ID: "${normalizedId}"`);
    
    // Simulate database/ERP lookup delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock invoice database - using normalized keys
    const mockInvoices = {
      '1001': { supplier: 'TechCorp Solutions', status: 'pending' },
      '1002': { supplier: 'Global Manufacturing Ltd', status: 'pending' },
      '1003': { supplier: 'Office Supplies Pro', status: 'pending' },
      '12345': { supplier: 'Test Supplier', status: 'pending' },
      '99999': { supplier: 'Debug Supplier', status: 'pending' },
      '100': { supplier: 'Small Invoice', status: 'pending' },
      '200': { supplier: 'Medium Invoice', status: 'pending' },
      '300': { supplier: 'Large Invoice', status: 'pending' },
      '2001': { supplier: 'Supplier A', status: 'pending' },
      '2002': { supplier: 'Supplier B', status: 'pending' },
      '5000': { supplier: 'New Supplier', status: 'pending' },
      '6000': { supplier: 'Another Supplier', status: 'pending' },
      '7000': { supplier: 'Final Supplier', status: 'pending' },
      '4984': { supplier: 'Chainlink Test Supplier', status: 'pending' },
      '0': { supplier: 'Zero Invoice', status: 'pending' }
    };

    const invoice = mockInvoices[normalizedId];
    
    console.log(`Looking up invoice: "${normalizedId}"`);
    console.log('Found invoice:', invoice);
    
    if (!invoice) {
      console.log(`❌ Invoice ${normalizedId} not found in database`);
      console.log('Available invoices:', Object.keys(mockInvoices));
      return false;
    }

    console.log(`✅ Invoice ${normalizedId} verified successfully`);
    console.log(`   Supplier: ${invoice.supplier}`);
    console.log(`   Status: ${invoice.status}`);
    console.log('--- VERIFICATION LOGIC END ---\n');
    return true;

  } catch (error) {
    console.error('❌ Error in verification logic:', error);
    return false;
  }
}

// Main serverless function handler
export default async function handler(req, res) {
  const startTime = Date.now();
  
  // Set CORS headers for all responses
  setCorsHeaders(res);

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight OPTIONS request');
    res.status(200).end();
    return;
  }

  console.log('=== CHAINLINK VERIFICATION REQUEST START ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  try {
    // Only allow POST method for invoice verification
    if (req.method !== 'POST') {
      console.log('❌ Invalid method:', req.method);
      res.status(405).json({
        error: 'Method not allowed',
        message: 'Only POST method is supported',
        allowedMethods: ['POST', 'OPTIONS']
      });
      return;
    }

    // Parse request body - using the enhanced version
    let body;
    try {
      body = await parseBody(req);
      console.log('Final parsed body:', JSON.stringify(body, null, 2));
      console.log('Body type after parsing:', typeof body);
      console.log('Is body an object?', typeof body === 'object' && body !== null);
    } catch (parseError) {
      console.log('❌ Body parsing error:', parseError.message);
      res.status(400).json({
        error: 'Invalid request body',
        message: 'Request body must be valid JSON',
        isValid: false,
        timestamp: Date.now()
      });
      return;
    }

    // Extract invoiceId from body with additional debugging
    const { invoiceId } = body;
    console.log('Extracted invoiceId:', invoiceId);
    console.log('InvoiceId type:', typeof invoiceId);
    console.log('Body keys:', Object.keys(body));
    console.log('Body values:', Object.values(body));

    // Validate invoiceId parameter
    if (invoiceId === undefined || invoiceId === null) {
      console.log('❌ Missing invoiceId parameter');
      console.log('Available properties in body:', Object.keys(body));
      res.status(400).json({
        error: 'Missing required parameters',
        message: 'invoiceId is required in request body',
        receivedBody: body,
        availableKeys: Object.keys(body),
        isValid: false,
        timestamp: Date.now()
      });
      return;
    }

    // Perform invoice verification
    console.log('🔍 Starting invoice verification for ID:', invoiceId);
    const isValid = await verifyInvoiceLogic(invoiceId);
    const processingTime = Date.now() - startTime;
    
    console.log('✅ Verification completed. Result:', isValid);
    console.log('⏱️ Processing time:', processingTime, 'ms');

    // Return success response
    const response = {
      isValid: isValid,
      invoiceId: invoiceId,
      timestamp: Date.now(),
      processingTime: processingTime,
      message: isValid ? 'Invoice verified successfully' : 'Invoice verification failed'
    };

    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
    console.log('=== CHAINLINK VERIFICATION REQUEST END ===');
    
    res.status(200).json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('💥 Unhandled error:', error.message);
    console.error('📊 Error stack:', error.stack);
    console.error('⏱️ Processing time before error:', processingTime, 'ms');
    
    const errorResponse = {
      error: 'Invoice verification failed',
      message: error.message,
      isValid: false,
      timestamp: Date.now(),
      processingTime: processingTime
    };
    
    console.log('📤 Sending error response:', JSON.stringify(errorResponse, null, 2));
    console.log('=== CHAINLINK VERIFICATION REQUEST END (ERROR) ===');
    
    res.status(500).json(errorResponse);
  }
}