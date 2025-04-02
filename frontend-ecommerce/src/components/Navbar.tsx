import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <Link href="/">🏠 Accueil</Link> |{" "}
      <Link href="/products">🛒 Voir les Produits</Link>
    </nav>
  );
}
