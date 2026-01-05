import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Dynamic import for Resend to avoid build-time resolution issues
const getResend = async () => {
  const { Resend } = await import("https://esm.sh/resend@2.0.0");
  return Resend;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyCustomerRequest {
  email: string;
  productName: string;
  productImage: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const { email, productName, productImage }: NotifyCustomerRequest = await req.json();
    
    console.log(`Sending back in stock notification to: ${email} for: ${productName}`);

    const Resend = await getResend();
    const resend = new Resend(resendApiKey);
    const emailResponse = await resend.emails.send({
      from: "Walmart <onboarding@resend.dev>",
      to: [email],
      subject: `🎉 Good news! ${productName} is back in stock!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0041C2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; text-align: center; }
            .product-image { max-width: 200px; border-radius: 8px; margin: 15px auto; }
            .cta-button { 
              display: inline-block; 
              background: #F6BE00; 
              color: #0041C2; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 Walmart</h1>
            </div>
            <div class="content">
              <h2>🎉 Great News!</h2>
              <p>The item you were waiting for is now back in stock!</p>
              
              <img src="${productImage}" alt="${productName}" class="product-image" />
              
              <h3>${productName}</h3>
              
              <p>Hurry - popular items sell out fast!</p>
              
              <a href="https://walmart.com" class="cta-button">Shop Now</a>
            </div>
            <div class="footer">
              <p>You received this email because you signed up for stock notifications.</p>
              <p>© ${new Date().getFullYear()} Walmart. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Notification email sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
