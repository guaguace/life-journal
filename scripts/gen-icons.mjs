/* 生成 App 图标：暖色手账本 + 月亮，espresso 渐变底 */
import sharp from 'sharp'

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8A5A36"/>
      <stop offset="1" stop-color="#67411F"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <!-- 小星星 -->
  <circle cx="118" cy="116" r="10" fill="#F0D78A" opacity="0.9"/>
  <circle cx="422" cy="86" r="7" fill="#F0D78A" opacity="0.75"/>
  <circle cx="86" cy="402" r="6" fill="#F0D78A" opacity="0.6"/>
  <circle cx="430" cy="350" r="5" fill="#F0D78A" opacity="0.5"/>
  <!-- 月亮 -->
  <path d="M368 104a60 60 0 1 0 60 60 46 46 0 1 1-60-60Z" fill="#F0D78A"/>
  <!-- 打开的手账本 -->
  <path d="M256 172c-22-16-52-26-84-26-16 0-31 2-44 7v222c13-5 28-7 44-7 32 0 62 10 84 26V172Z" fill="#FFFCF8"/>
  <path d="M256 172c22-16 52-26 84-26 16 0 31 2 44 7v222c-13-5-28-7-44-7-32 0-62 10-84 26V172Z" fill="#F2E6D5"/>
  <line x1="256" y1="176" x2="256" y2="392" stroke="#DCC9AE" stroke-width="5"/>
  <!-- 书页横线 -->
  <path d="M184 224h46M184 258h46M184 292h46M184 326h46" stroke="#DCC9AE" stroke-width="6" stroke-linecap="round"/>
  <path d="M282 224h46M282 258h46M282 292h46" stroke="#DCC9AE" stroke-width="6" stroke-linecap="round"/>
</svg>`

await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('public/icon-512.png')
await sharp(Buffer.from(svg)).resize(192, 192).png().toFile('public/icon-192.png')
await sharp(Buffer.from(svg)).resize(180, 180).png().toFile('public/icon-180.png')
console.log('✅ 图标已生成: icon-512.png / icon-192.png / icon-180.png')
