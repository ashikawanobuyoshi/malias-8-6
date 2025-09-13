import nodemailer from 'nodemailer';
import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';

interface MailButton {
  text: string;
  url: string;
  color?: string;    // 背景色
  icon?: string;     // アイコン
  show?: boolean;
}

interface MailTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  errorColor: string;
  fontFamily: string;
  buttonRadius: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const to: string = body.to ?? '';
  const subject: string = body.subject ?? '【無題】';
  const text: string = body.text ?? '';
  const items: any[] = Array.isArray(body.items) ? body.items : [];
  const images: any[] = Array.isArray(body.images) ? body.images : [];
  const remarks: string = body.remarks ?? '';
  const shipping: number = Number(body.shipping ?? 0);
  const fee: number = Number(body.fee ?? 0);

  const status: string = body.status ?? 'pending';

  const detailUrl: string = body.detailUrl ?? '#';
  const paymentUrl: string = body.paymentUrl ?? '#';
  const cancelUrl: string = body.cancelUrl ?? '#';

  const config = useRuntimeConfig();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  });

  // テーマ設定
  const theme: MailTheme = {
    primaryColor: '#1a73e8',
    secondaryColor: '#4caf50',
    accentColor: '#ff9800',
    errorColor: '#f44336',
    fontFamily: "'Helvetica', Arial, sans-serif",
    buttonRadius: '6px',
  };

  const taxRate = 0.10;
  let totalExclTax = 0;

  const itemsRows = items.map((item: any) => {
    const title = item.title ?? '商品名未設定';
    const quantity = Number(item.quantity ?? 1);
    const price = Number(item.price ?? 0);
    const subtotal = quantity * price;
    totalExclTax += subtotal;
    return `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">🛒 ${title}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${quantity}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">¥${price.toLocaleString()}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">¥${subtotal.toLocaleString()}</td>
      </tr>
    `;
  }).join("") || `
    <tr><td colspan="4" style="padding:8px;border:1px solid #ddd;text-align:center;">商品はありません</td></tr>
  `;

  const imagesHtml = images.map((img: any, idx: number) => {
    const name = img.name ?? `画像 ${idx + 1}`;
    const url = img.url ?? '#';
    return `<li>🖼 <a href="${url}" target="_blank" style="color:${theme.primaryColor}; text-decoration:none;">${name}</a></li>`;
  }).join("") || "";

  const tax = Math.round(totalExclTax * taxRate);
  const finalTotal = totalExclTax + tax + shipping + fee;

  // ボタンテンプレート
  const buttons: MailButton[] = [
    { text: '注文詳細を見る', url: detailUrl, color: theme.primaryColor, icon: '📄', show: true },
    { text: '支払い確認', url: paymentUrl, color: theme.secondaryColor, icon: '💳', show: status === 'pending' },
    { text: '注文をキャンセル', url: cancelUrl, color: theme.errorColor, icon: '❌', show: status === 'cancelable' },
  ];

  const buttonsHtml = buttons
    .filter(btn => btn.show !== false)
    .map(btn => `<a href="${btn.url}" target="_blank" style="display:block; background:${btn.color}; color:#fff; text-decoration:none; padding:12px 20px; border-radius:${theme.buttonRadius}; font-weight:bold; margin-bottom:10px;">${btn.icon || ''} ${btn.text}</a>`)
    .join("");

  const htmlBody = `
    <div style="font-family:${theme.fontFamily}; color:#333; line-height:1.6; max-width:700px; margin:0 auto; background: linear-gradient(135deg,#f0f4ff,#ffffff); padding:20px; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color:${theme.primaryColor}; border-bottom:2px solid ${theme.primaryColor}; padding-bottom:8px;">📝 ご注文内容のご確認</h2>
      <p style="font-size:14px;">${text}</p>

      <div style="overflow-x:auto;">
        <table style="border-collapse: collapse; width:100%; margin-top:10px; background:#fff; border-radius:6px; overflow:hidden; min-width:400px;">
          <thead>
            <tr style="background:${theme.primaryColor}; color:#fff;">
              <th style="padding:8px;border:1px solid #ddd;">商品名</th>
              <th style="padding:8px;border:1px solid #ddd;">数量</th>
              <th style="padding:8px;border:1px solid #ddd;">単価</th>
              <th style="padding:8px;border:1px solid #ddd;">小計</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
      </div>

      ${imagesHtml ? `<div style="margin-top:10px;"><strong>画像リンク:</strong><ul>${imagesHtml}</ul></div>` : ""}

      <div style="margin-top:15px; font-size:14px;">
        <p>💰 合計（税抜き）: <strong style="color:${theme.accentColor};">¥${totalExclTax.toLocaleString()}</strong></p>
        <p>🧾 消費税（10%）: <strong style="color:${theme.accentColor};">¥${tax.toLocaleString()}</strong></p>
        <p>🚚 送料: <strong style="color:${theme.secondaryColor};">¥${shipping.toLocaleString()}</strong></p>
        <p>⚙️ 手数料: <strong style="color:#9c27b0;">¥${fee.toLocaleString()}</strong></p>
        <p style="font-size:16px; color:${theme.errorColor};">💎 最終合計（税込）: <strong>¥${finalTotal.toLocaleString()}</strong></p>
        <p>📝 備考: ${remarks || "なし"}</p>
      </div>

      <div style="text-align:center; margin:20px 0; display:flex; flex-direction:column; gap:10px;">
        ${buttonsHtml}
      </div>

      <p style="margin-top:20px; font-size:12px; color:#777;">このメールは自動送信です。返信しないでください。</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"studio malias" <${config.smtpUser}>`,
      to,
      subject,
      text,
      html: htmlBody
    });
    console.log('送信情報:', info);
    return { success: true, info };
  } catch (err) {
    console.error('送信エラー:', err);
    return { success: false, error: err };
  }
});








