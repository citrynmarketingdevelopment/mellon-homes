import Image from "next/image";
import logo from "../../public/mellon-logo.png";
import styles from "./brand-logo.module.css";

export default function BrandLogo({ priority = false }: { priority?: boolean }) {
  return <Image src={logo} alt="Mellon Real Estate" className={styles.logo} sizes="(max-width: 767px) 130px, 180px" priority={priority} />;
}
