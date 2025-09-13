// server/api/order.ts
import { defineEventHandler, readBody } from "h3"
import { sendEmail } from "~/server/utils/mailer" // ← nodemailer をラップした関数（仮定）

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { name, email, address, note, items, options, customItems } = body

  // 合計計算
  const subtotal =
    [...items, ...options, ...customItems].reduce((sum, i) => sum + i.qty * i.price, 0)
  const tax = Math.floor(subtotal * 0.1)
  const total = subtotal + tax

  const html = `
    <h2>ご注文内容</h2>

    <h3>お気に入り画像プリント</h3>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr><th>商品名</th><th>数量</th><th>単価</th><th>小計</th></tr>
      ${items.map((i: any) => `
        <tr>
          <td>${i.name}</td>
          <td>${i.qty}</td>
          <td>${i.price.toLocaleString()}円</td>
          <td>${(i.qty * i.price).toLocaleString()}円</td>
        </tr>
      `).join("")}
    </table>

    <h3>追加オプション</h3>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr><th>オプション</th><th>数量</th><th>単価</th><th>小計</th></tr>
      ${options.map((o: any) => `
        <tr>
          <td>${o.name}</td>
          <td>${o.qty}</td>
          <td>${o.price.toLocaleString()}円</td>
          <td>${(o.qty * o.price).toLocaleString()}円</td>
        </tr>
      `).join("")}
    </table>

    <h3>カスタムアイテム</h3>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr><th>商品名</th><th>数量</th><th>単価</th><th>小計</th></tr>
      ${customItems.map((c: any) => `
        <tr>
          <td>${c.name}</td>
          <td>${c.qty}</td>
          <td>${c.price.toLocaleString()}円</td>
          <td>${(c.qty * c.price).toLocaleString()}円</td>
        </tr>
      `).join("")}
    </table>

    <h3>合計</h3>
    <p>小計: ${subtotal.toLocaleString()}円</p>
    <p>消費税 (10%): ${tax.toLocaleString()}円</p>
    <p><b>合計（税込）: ${total.toLocaleString()}円</b></p>

    <h3>お客様情報</h3>
    <p><b>お名前:</b> ${name}</p>
    <p><b>メール:</b> ${email}</p>
    <p><b>住所:</b> ${address}</p>
    <p><b>備考:</b><br>${note}</p>
  `

  // 管理者へ送信
  await sendEmail({
    to: "info@studiomalias.jp",
    subject: "新しいご注文が届きました",
    html,
  })

  // お客様へ確認メール（控え）
  await sendEmail({
    to: email,
    subject: "【スタジオマリアス】ご注文ありがとうございます",
    html,
  })

  return { success: true }
})

  