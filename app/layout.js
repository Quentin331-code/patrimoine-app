import './globals.css';

export const metadata = {
  title: 'Mon Patrimoine',
  description: 'Suivez votre patrimoine en temps réel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
