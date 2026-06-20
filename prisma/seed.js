const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Cleaning database...');
  // Delete in reverse dependency order
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Database cleaned.');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: adminPassword,
      phone: '0111234567',
      address: 'Colombo, Sri Lanka',
      role: 'admin',
    },
  });

  // Create Customer User
  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'customer@gmail.com',
      password: customerPassword,
      phone: '0771234567',
      address: 'Kandy, Sri Lanka',
      role: 'customer',
    },
  });

  console.log('✅ Admin and Customer users created.');

  // Create Categories
  const catLaptops = await prisma.category.create({
    data: { category_name: 'Laptops', description: 'High-performance laptops for work, gaming and study.' }
  });
  const catDesktops = await prisma.category.create({
    data: { category_name: 'Desktops', description: 'Gaming and workstation Desktop PCs.' }
  });
  const catParts = await prisma.category.create({
    data: { category_name: 'PC Parts', description: 'RAM, SSDs, GPUs, Processors and Motherboards.' }
  });
  const catAccessories = await prisma.category.create({
    data: { category_name: 'Accessories', description: 'Gaming Mice, Keyboards, Headsets, and Monitors.' }
  });

  console.log('✅ Categories created.');

  console.log('🔄 Generating 100+ product variations...');
  const productsData = [];

  // 1. Laptop Templates (Generate 35 laptops)
  const laptopSpecs = [
    { name: 'ASUS ROG Zephyrus G14 Gaming Laptop', brand: 'ASUS', img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80' },
    { name: 'Lenovo Legion 5 Pro Gaming Laptop', brand: 'Lenovo', img: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?auto=format&fit=crop&w=800&q=80' },
    { name: 'Apple MacBook Pro 14" Space Gray', brand: 'Apple', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80' },
    { name: 'HP Pavilion Gaming Series Laptop', brand: 'HP', img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80' },
    { name: 'Dell XPS 15 Premium Laptop', brand: 'Dell', img: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=800&q=80' },
    { name: 'Acer Predator Helios Elite Laptop', brand: 'Acer', img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Razer Blade 16 Gaming Laptop', brand: 'Razer', img: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?auto=format&fit=crop&w=800&q=80' }
  ];

  laptopSpecs.forEach((spec) => {
    const configs = [
      { ram: '8GB DDR5', ssd: '512GB NVMe SSD', cpu: 'Intel Core i5', priceMod: 0.8 },
      { ram: '16GB DDR5', ssd: '512GB NVMe SSD', cpu: 'Intel Core i7', priceMod: 1.0 },
      { ram: '16GB DDR5', ssd: '1TB NVMe SSD', cpu: 'Intel Core i7', priceMod: 1.15 },
      { ram: '32GB DDR5', ssd: '1TB NVMe SSD', cpu: 'Intel Core i9', priceMod: 1.45 },
      { ram: '64GB DDR5', ssd: '2TB NVMe SSD', cpu: 'Intel Core i9', priceMod: 1.9 }
    ];
    
    configs.forEach(config => {
      productsData.push({
        product_name: `${spec.name} - ${config.cpu} / ${config.ram} / ${config.ssd}`,
        brand: spec.brand,
        description: `Premium high-performance ${spec.name} featuring ${config.cpu} processor, ${config.ram} high-speed memory, and ultra-fast ${config.ssd} storage. Engineered for gaming, development, and heavy professional workloads.`,
        price: Math.round(230000 * config.priceMod),
        stock_quantity: Math.floor(Math.random() * 10) + 3,
        image_url: spec.img,
        category_id: catLaptops.category_id
      });
    });
  });

  // 2. Desktop Templates (Generate 25 desktops)
  const desktopSpecs = [
    { name: 'Apex Custom Gaming Desktop PC', brand: 'TechShop Build', img: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Pro-Creator Workstation Desktop', brand: 'TechShop Build', img: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=800&q=80' },
    { name: 'MSI Aegis Gaming Desktop PC', brand: 'MSI', img: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80' }
  ];

  desktopSpecs.forEach(spec => {
    const configs = [
      { cpu: 'AMD Ryzen 5 7600X', gpu: 'NVIDIA RTX 4060 8GB', ram: '16GB DDR5', ssd: '1TB NVMe', priceMod: 1.0 },
      { cpu: 'AMD Ryzen 7 7800X3D', gpu: 'NVIDIA RTX 4070 Ti 12GB', ram: '32GB DDR5', ssd: '1TB NVMe', priceMod: 1.45 },
      { cpu: 'Intel Core i5 13400F', gpu: 'NVIDIA RTX 3060 12GB', ram: '16GB DDR4', ssd: '512GB NVMe', priceMod: 0.8 },
      { cpu: 'Intel Core i7 14700K', gpu: 'NVIDIA RTX 4080 Super 16GB', ram: '32GB DDR5', ssd: '2TB NVMe', priceMod: 2.1 },
      { cpu: 'Intel Core i9 14900K', gpu: 'NVIDIA RTX 4090 24GB', ram: '64GB DDR5', ssd: '4TB NVMe', priceMod: 3.4 }
    ];
    
    configs.forEach(config => {
      productsData.push({
        product_name: `${spec.name} (${config.cpu} / ${config.gpu} / ${config.ram})`,
        brand: spec.brand,
        description: `Custom pre-built desktop system featuring ${config.cpu} CPU, powerful ${config.gpu} discrete graphics card, ${config.ram} system memory, and high-performance ${config.ssd} storage. Ready to plug and play with pre-installed Windows 11.`,
        price: Math.round(260000 * config.priceMod),
        stock_quantity: Math.floor(Math.random() * 5) + 2,
        image_url: spec.img,
        category_id: catDesktops.category_id
      });
    });
  });

  // 3. PC Parts Templates (Generate 30 parts)
  // RAM (12 variants)
  const ramBrands = ['Corsair Vengeance', 'Kingston FURY Beast', 'G.Skill Trident Z5'];
  const ramImgs = ['https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80'];
  ramBrands.forEach(brand => {
    const configs = [
      { spec: '16GB (2x8GB) DDR4 3200MHz', price: 16500 },
      { spec: '32GB (2x16GB) DDR4 3600MHz', price: 29000 },
      { spec: '16GB (2x8GB) DDR5 5200MHz', price: 24500 },
      { spec: '32GB (2x16GB) DDR5 6000MHz', price: 42000 }
    ];
    configs.forEach(config => {
      productsData.push({
        product_name: `${brand} RGB ${config.spec} Desktop Memory`,
        brand: brand.split(' ')[0],
        description: `High performance RGB desktop memory kit. Featuring carefully screened ICs for extended overclocking potential and customizable dynamic multi-zone RGB lighting.`,
        price: config.price,
        stock_quantity: Math.floor(Math.random() * 20) + 5,
        image_url: ramImgs[0],
        category_id: catParts.category_id
      });
    });
  });

  // SSDs (9 variants)
  const ssdBrands = ['Samsung 990 PRO', 'Crucial P3 Plus', 'Kingston NV2'];
  const ssdImgs = ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'];
  ssdBrands.forEach(brand => {
    const configs = [
      { spec: '500GB NVMe M.2 SSD', priceMod: 0.6 },
      { spec: '1TB NVMe M.2 SSD', priceMod: 1.0 },
      { spec: '2TB NVMe M.2 SSD', priceMod: 1.7 }
    ];
    const basePrice = brand.includes('Samsung') ? 35000 : brand.includes('Crucial') ? 22000 : 18000;
    configs.forEach(config => {
      productsData.push({
        product_name: `${brand} PCIe Gen4 x4 ${config.spec}`,
        brand: brand.split(' ')[0],
        description: `Solid State Drive with NVMe interface. Sequential read speeds up to 7450 MB/s for lightning-fast boot times, instant application load times and heavy gaming workloads.`,
        price: Math.round(basePrice * config.priceMod),
        stock_quantity: Math.floor(Math.random() * 15) + 5,
        image_url: ssdImgs[0],
        category_id: catParts.category_id
      });
    });
  });

  // GPUs (9 variants)
  const gpus = [
    { name: 'NVIDIA GeForce RTX 4060 Dual', brand: 'MSI', price: 145000 },
    { name: 'NVIDIA GeForce RTX 4070 Super EVO', brand: 'ASUS', price: 285000 },
    { name: 'NVIDIA GeForce RTX 4080 Super Gaming', brand: 'Gigabyte', price: 420000 },
    { name: 'AMD Radeon RX 7600 XT Pulse', brand: 'Sapphire', price: 125000 },
    { name: 'AMD Radeon RX 7800 XT Challenger', brand: 'ASRock', price: 215000 },
    { name: 'NVIDIA GeForce RTX 4090 ROG Strix', brand: 'ASUS', price: 820000 }
  ];
  gpus.forEach(gpu => {
    productsData.push({
      product_name: `${gpu.brand} ${gpu.name} Graphic Card`,
      brand: gpu.brand,
      description: `Premium desktop graphics card featuring advanced custom cooling fans, thick heat pipes, and robust metal backplate. Ideal for high frame rate gaming, 4K rendering, and AI workloads.`,
      price: gpu.price,
      stock_quantity: Math.floor(Math.random() * 6) + 2,
      image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80',
      category_id: catParts.category_id
    });
  });

  // 4. Accessories Templates (Generate 25 accessories)
  // Mouse (9 variants)
  const mouseBrands = ['Logitech G502 Hero', 'Razer DeathAdder Essential', 'Corsair Harpoon Pro'];
  const mouseColors = ['Black', 'White', 'Special Edition RGB'];
  mouseBrands.forEach(brand => {
    const basePrice = brand.includes('Razer') ? 9500 : brand.includes('Logitech') ? 18500 : 12000;
    mouseColors.forEach((color, idx) => {
      productsData.push({
        product_name: `${brand} Wired Gaming Mouse (${color})`,
        brand: brand.split(' ')[0],
        description: `Ergonomic high-performance wired gaming mouse in ${color} style. Featuring high-precision optical sensors, customizable buttons, and responsive click tensioning.`,
        price: Math.round(basePrice * (1 + (idx * 0.1))),
        stock_quantity: Math.floor(Math.random() * 25) + 5,
        image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
        category_id: catAccessories.category_id
      });
    });
  });

  // Keyboard (9 variants)
  const kbBrands = ['Keychron K2 Wireless Mechanical', 'Razer BlackWidow V4 Mechanical', 'Logitech G Pro Gaming mechanical'];
  const switchTypes = ['Red Switch (Quiet)', 'Blue Switch (Clicky)', 'Brown Switch (Tactile)'];
  kbBrands.forEach(brand => {
    const basePrice = brand.includes('Keychron') ? 28000 : brand.includes('Razer') ? 45000 : 38000;
    switchTypes.forEach((sw, idx) => {
      productsData.push({
        product_name: `${brand} Keyboard - ${sw}`,
        brand: brand.split(' ')[0],
        description: `High durability mechanical keyboard configured with ${sw} keys. Features RGB backlit zones, full key rollover anti-ghosting, and compatible with both Windows & Mac layouts.`,
        price: Math.round(basePrice * (1 + (idx * 0.05))),
        stock_quantity: Math.floor(Math.random() * 12) + 4,
        image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        category_id: catAccessories.category_id
      });
    });
  });

  // Monitors (8 variants)
  const monitorSpecs = [
    { name: 'Odyssey G5 Curved Gaming Monitor', brand: 'Samsung', size: '27"', hz: '144Hz', price: 95000 },
    { name: 'Odyssey G7 Curved Gaming Monitor', brand: 'Samsung', size: '32"', hz: '240Hz', price: 185000 },
    { name: 'UltraGear IPS Flat Monitor', brand: 'LG', size: '24"', hz: '144Hz', price: 54000 },
    { name: 'UltraGear QHD Gaming Monitor', brand: 'LG', size: '27"', hz: '165Hz', price: 89000 },
    { name: 'Optix Curved High Resolution Monitor', brand: 'MSI', size: '32"', hz: '165Hz', price: 165000 },
    { name: 'TUF Gaming Curved Monitor', brand: 'ASUS', size: '27"', hz: '165Hz', price: 78000 },
    { name: 'ROG Swift OLED Gaming Monitor', brand: 'ASUS', size: '34"', hz: '240Hz', price: 345000 },
    { name: 'ProArt Professional Creator Monitor', brand: 'ASUS', size: '27"', hz: '75Hz', price: 125000 }
  ];
  monitorSpecs.forEach(mon => {
    productsData.push({
      product_name: `${mon.brand} ${mon.size} ${mon.name} (${mon.hz})`,
      brand: mon.brand,
      description: `${mon.size} premium high refresh-rate (${mon.hz}) gaming monitor with adaptive sync and HDR mode. Designed to minimize screen tearing, screen shuttering and input lag.`,
      price: mon.price,
      stock_quantity: Math.floor(Math.random() * 6) + 2,
      image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      category_id: catAccessories.category_id
    });
  });

  // Bulk Insert Products to PostgreSQL via Prisma
  console.log(`🔄 Saving ${productsData.length} products to database...`);
  await prisma.product.createMany({
    data: productsData
  });

  console.log('✅ Products seeded successfully.');
  console.log('🎉 Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
