// Base de données des titres disponibles
export const STOCKS_DB = [
  // US Stocks
  { ticker: 'AAPL', isin: 'US0378331005', name: 'Apple Inc.', color: '#555', type: 'Action' },
  { ticker: 'MSFT', isin: 'US5949181045', name: 'Microsoft Corp.', color: '#00a4ef', type: 'Action' },
  { ticker: 'NVDA', isin: 'US67066G1040', name: 'NVIDIA Corp.', color: '#76b900', type: 'Action' },
  { ticker: 'GOOGL', isin: 'US02079K3059', name: 'Alphabet Inc.', color: '#4285f4', type: 'Action' },
  { ticker: 'AMZN', isin: 'US0231351067', name: 'Amazon.com Inc.', color: '#ff9900', type: 'Action' },
  { ticker: 'TSLA', isin: 'US88160R1014', name: 'Tesla Inc.', color: '#cc0000', type: 'Action' },
  { ticker: 'META', isin: 'US30303M1027', name: 'Meta Platforms', color: '#0668e1', type: 'Action' },
  // FR Stocks
  { ticker: 'MC.PA', isin: 'FR0000121014', name: 'LVMH Moët Hennessy', color: '#8B6914', type: 'Action' },
  { ticker: 'OR.PA', isin: 'FR0000120321', name: "L'Oréal SA", color: '#333', type: 'Action' },
  { ticker: 'AI.PA', isin: 'FR0000120073', name: 'Air Liquide SA', color: '#004a8f', type: 'Action' },
  { ticker: 'SAN.PA', isin: 'FR0000120578', name: 'Sanofi SA', color: '#7a00cc', type: 'Action' },
  { ticker: 'TTE.PA', isin: 'FR0000120271', name: 'TotalEnergies SE', color: '#ff0000', type: 'Action' },
  { ticker: 'SU.PA', isin: 'FR0000121972', name: 'Schneider Electric SE', color: '#3dcd58', type: 'Action' },
  { ticker: 'BNP.PA', isin: 'FR0000131104', name: 'BNP Paribas SA', color: '#00915a', type: 'Action' },
  { ticker: 'DG.PA', isin: 'FR0000125486', name: 'Vinci SA', color: '#003d6b', type: 'Action' },
  { ticker: 'RMS.PA', isin: 'FR0000052292', name: 'Hermès International', color: '#f07000', type: 'Action' },
  { ticker: 'CAP.PA', isin: 'FR0000125338', name: 'Capgemini SE', color: '#0070ad', type: 'Action' },
  { ticker: 'KER.PA', isin: 'FR0000121485', name: 'Kering SA', color: '#1a1a1a', type: 'Action' },
  // ETF Amundi
  { ticker: 'CW8.PA', isin: 'LU1681043599', name: 'Amundi MSCI World UCITS ETF', color: '#00a86b', type: 'ETF' },
  { ticker: '500.PA', isin: 'LU1681048804', name: 'Amundi PEA S&P 500 UCITS ETF', color: '#00a86b', type: 'ETF' },
  { ticker: 'PANX.PA', isin: 'LU1681038672', name: 'Amundi PEA Nasdaq-100 ETF', color: '#00a86b', type: 'ETF' },
  { ticker: 'PAEEM.PA', isin: 'LU1681045370', name: 'Amundi PEA MSCI Emerging Markets ETF', color: '#00a86b', type: 'ETF' },
  { ticker: 'CE8.PA', isin: 'LU1681040819', name: 'Amundi Euro Stoxx 50 ETF', color: '#00a86b', type: 'ETF' },
  // ETF BNP
  { ticker: 'ESE.PA', isin: 'FR0011550185', name: 'BNP Paribas Easy S&P 500 ETF', color: '#00915a', type: 'ETF' },
  { ticker: 'EEE.PA', isin: 'FR0011550193', name: 'BNP Paribas Easy Euro Stoxx 50 ETF', color: '#00915a', type: 'ETF' },
  // ETF iShares / Vanguard
  { ticker: 'IWDA.AS', isin: 'IE00B4L5Y983', name: 'iShares Core MSCI World UCITS ETF', color: '#000', type: 'ETF' },
  { ticker: 'VWCE.DE', isin: 'IE00BK5BQT80', name: 'Vanguard FTSE All-World UCITS ETF', color: '#822728', type: 'ETF' },
  { ticker: 'WPEA.PA', isin: 'IE0002XZSHO1', name: 'iShares MSCI World Swap PEA ETF', color: '#000', type: 'ETF' },
  // Crypto
  { ticker: 'BTC-EUR', isin: 'CRYPTO-BTC', name: 'Bitcoin', color: '#f7931a', type: 'Crypto' },
  { ticker: 'ETH-EUR', isin: 'CRYPTO-ETH', name: 'Ethereum', color: '#627eea', type: 'Crypto' },
  { ticker: 'SOL-EUR', isin: 'CRYPTO-SOL', name: 'Solana', color: '#9945ff', type: 'Crypto' },
  { ticker: 'BNB-EUR', isin: 'CRYPTO-BNB', name: 'BNB (Binance)', color: '#f3ba2f', type: 'Crypto' },
  { ticker: 'ADA-EUR', isin: 'CRYPTO-ADA', name: 'Cardano', color: '#0033ad', type: 'Crypto' },
  { ticker: 'XRP-EUR', isin: 'CRYPTO-XRP', name: 'Ripple (XRP)', color: '#23292f', type: 'Crypto' },
];

export const METALS_DB = [
  { id: 'gold', name: 'Or', symbol: 'Au', color: '#f0c040' },
  { id: 'silver', name: 'Argent', symbol: 'Ag', color: '#c0c0c0' },
  { id: 'platinum', name: 'Platine', symbol: 'Pt', color: '#e5e4e2' },
  { id: 'palladium', name: 'Palladium', symbol: 'Pd', color: '#b8a9a1' },
];

export const CRYPTO_IDS = {
  'BTC-EUR': 'bitcoin',
  'ETH-EUR': 'ethereum',
  'SOL-EUR': 'solana',
  'BNB-EUR': 'binancecoin',
  'ADA-EUR': 'cardano',
  'XRP-EUR': 'ripple',
};

export const CATEGORIES = {
  immobilier: { label: 'Immobilier', icon: '🏠', color: '#4da6ff', liq: 'illiquid', subs: ['Résidence principale', 'Investissement locatif', 'SCPI / OPCI', 'Parking / Cave', 'Terrain', 'Autre immobilier'] },
  bourse: { label: 'Bourse', icon: '📈', color: '#5865f2', liq: 'liquid', subs: ['PEA', 'Compte-titres', 'ETF', 'Actions', 'Obligations', 'Assurance-vie UC'], live: true },
  nonCote: { label: 'Actifs non cotés', icon: '🏢', color: '#9b6dff', liq: 'illiquid', subs: ['Private Equity', 'Private Credit', 'Parts de société', 'Startup / Business Angel', 'Crowdfunding', 'Autre non coté'] },
  crypto: { label: 'Crypto', icon: '₿', color: '#f5a623', liq: 'liquid', subs: ['Bitcoin', 'Ethereum', 'Stablecoins', 'Altcoins', 'DeFi / Staking', 'NFT'], live: true },
  or: { label: 'Or & Métaux', icon: '🥇', color: '#f0c040', liq: 'semi', subs: ['Or physique', 'Or papier (ETF)', 'Argent', 'Platine', 'Autre métal'], metals: true },
  autres: { label: 'Autres actifs', icon: '💎', color: '#43d9a0', liq: 'illiquid', subs: ['Montres', 'Art', 'Vin', 'Voitures de collection', 'Sacs / Luxe', 'Forêt / Vignes', 'Autre'] },
  epargne: { label: 'Épargne liquide', icon: '🏦', color: '#36c5dc', liq: 'liquid', subs: ['Livret A', 'LDDS', 'LEP', 'Compte courant', 'Fonds euro (AV)', 'PEL / CEL', 'Autre épargne'] },
  passif: { label: 'Passif (Dettes)', icon: '📋', color: '#f0605d', liq: 'na', subs: ['Crédit immobilier', 'Crédit conso', 'Prêt étudiant', 'Crédit auto', 'Autre dette'] },
};
