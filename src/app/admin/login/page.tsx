import { cmsConfigured } from "@/lib/cms/config";
import LoginForm from "@/components/cms/LoginForm";
import styles from "../admin.module.css";

export default function LoginPage() {
  const configured = cmsConfigured();
  return <section className={styles.login}><h1 className={styles.srOnly}>Sign in</h1>
    {!configured && <div className={styles.notice}><strong>Ready to connect.</strong><p>Add the Neon connection and authentication settings to the environment, then run the CMS setup commands. Login stays disabled until setup is complete.</p></div>}
    <LoginForm enabled={configured} />
  </section>;
}
