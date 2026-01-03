import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  productName: string;
  category: string;
  currentStock: number;
  threshold: number;
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
    const { productName, category, currentStock, threshold }: AlertEmailRequest = await req.json();
    
    console.log(`Sending inventory alert for: ${productName}`);

    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: "Walmart Inventory <onboarding@resend.dev>",
      to: ["meghanab235@gmail.com"],
      subject: `⚠️ Low Stock Alert: ${productName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0041C2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .alert-box { background: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; margin: 15px 0; }
            .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .info-table td { padding: 10px; border-bottom: 1px solid #ddd; }
            .info-table td:first-child { font-weight: bold; color: #666; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 Walmart Inventory Alert</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <strong>⚠️ Low Stock Warning</strong>
                <p>The following product has fallen below the stock threshold and requires immediate attention.</p>
              </div>
              
              <table class="info-table">
                <tr>
                  <td>Product Name</td>
                  <td>${productName}</td>
                </tr>
                <tr>
                  <td>Category</td>
                  <td>${category}</td>
                </tr>
                <tr>
                  <td>Current Stock</td>
                  <td style="color: #EF4444; font-weight: bold;">${currentStock} units</td>
                </tr>
                <tr>
                  <td>Threshold</td>
                  <td>${threshold} units</td>
                </tr>
                <tr>
                  <td>Alert Time</td>
                  <td>${new Date().toLocaleString()}</td>
                </tr>
              </table>
              
              <p>Please restock this item as soon as possible to avoid stockouts.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the Walmart Inventory Management System.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Alert email sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending alert email:", error);
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
