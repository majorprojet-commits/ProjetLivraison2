export class InitializePayUnitPayment {
  async execute(data: {
    amount: number;
    currency: string;
    transactionId: string;
    returnUrl: string;
    notifyUrl: string;
    description: string;
  }) {
    const apiKey = process.env.PAYUNIT_API_KEY;
    const apiSecret = process.env.PAYUNIT_API_SECRET;
    const appId = process.env.PAYUNIT_APP_ID;
    const environment = process.env.PAYUNIT_ENVIRONMENT || 'sandbox';

    if (!apiKey || !apiSecret || !appId) {
      console.error('[PayUnit] Missing configuration:', { apiKey: !!apiKey, apiSecret: !!apiSecret, appId: !!appId });
      throw new Error('PayUnit credentials are not configured. Please add PAYUNIT_API_KEY, PAYUNIT_API_SECRET, and PAYUNIT_APP_ID to your secrets.');
    }

    // Try multiple possible endpoints based on user documentation and common patterns
    const endpoints = [
      'https://api.payunit.net/api/v1',
      'https://api.payunit.net/api/v2',
      'https://gateway.payunit.net/api/v1',
      'https://gateway.payunit.net/api/v2',
      'https://payunit.net/api/v1',
      'https://payunit.net/api/v2',
    ];

    // PayUnit documentation uses 'test' instead of 'sandbox' for the mode header
    const payunitMode = environment === 'sandbox' ? 'test' : 'live';

    if (environment === 'sandbox') {
      endpoints.unshift('https://sandbox.api.payunit.net/api/v1');
      endpoints.unshift('https://sandbox.payunit.net/api/v1');
    }
    
    const payload = {
      total_amount: String(data.amount),
      currency: data.currency,
      transaction_id: data.transactionId,
      return_url: data.returnUrl,
      notify_url: data.notifyUrl,
      description: data.description,
      app_id: appId
    };

    let lastError: any = null;

    for (const baseUrl of endpoints) {
      const fullUrl = baseUrl.endsWith('/') ? `${baseUrl}payment/initialize` : `${baseUrl}/payment/initialize`;
      console.log(`[PayUnit] Attempting initialization at ${fullUrl} (Mode: ${payunitMode})`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout per attempt

      try {
        const authHeader = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authHeader}`,
            'x-api-key': apiKey,
            'x-api-secret': apiSecret,
            'x-app-id': appId,
            'mode': payunitMode,
            // Additional compatibility headers
            'api-user': apiKey,
            'api-password': apiSecret,
            'application-token': appId,
            'x-auth-token': appId,
            'User-Agent': 'AI-Studio-App/1.0.0'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const responseText = await response.text();
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          const isHtml = responseText.toLowerCase().includes('<html') || responseText.toLowerCase().includes('<title');
          console.warn(`[PayUnit] Non-JSON response from ${fullUrl}. Status: ${response.status}. ${isHtml ? 'HTML Error detected.' : ''} Body preview: ${responseText.substring(0, 300)}`);
          lastError = new Error(`Invalid response (Status ${response.status}) from ${baseUrl}. The server returned an HTML error page instead of JSON.`);
          continue;
        }

        if (!response.ok || (result.status && result.status !== 'SUCCESS' && result.status !== 'success' && result.status !== 200)) {
          console.error(`[PayUnit] Initialization failed at ${fullUrl}:`, result);
          lastError = new Error(result.message || `Failed to initialize PayUnit payment (Status: ${response.status})`);
          continue;
        }

        console.log(`[PayUnit] Success at ${fullUrl}`);
        return result;
      } catch (e: any) {
        clearTimeout(timeoutId);
        console.warn(`[PayUnit] Fetch error at ${fullUrl}:`, e.message, e.cause ? `Cause: ${e.cause}` : '');
        lastError = e;
        if (e.name === 'AbortError') {
          lastError = new Error(`Request timed out at ${fullUrl}`);
        }
      }
    }

    throw lastError || new Error('Failed to connect to PayUnit API after trying all endpoints.');
  }
}
