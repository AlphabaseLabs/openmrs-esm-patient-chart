import React from 'react';
import { FormLabel, Heading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './erx-print.scss';

interface ErxPrintHeaderProps {
  logoSrc: string;
  logoAlt: string;
  facilityName: string;
  clinicTagline?: string;
  providerName: string;
  providerSpecialty?: string;
  providerQualification?: string;
}

const ErxPrintHeader: React.FC<ErxPrintHeaderProps> = ({
  logoSrc,
  logoAlt,
  facilityName,
  clinicTagline,
  providerName,
  providerSpecialty,
  providerQualification,
}) => {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.brandSection}>
          <div className={styles.logoSection}>
            {logoSrc ? (
              <div className={styles.headerLogo}>
                <img src={logoSrc} alt={logoAlt} className={styles.logo} />
              </div>
            ) : (
              <div className={styles.logoFallback}>{t('logo', 'Logo')}</div>
            )}
          </div>

          <div className={styles.brandDivider} aria-hidden="true" />

          <div className={styles.clinicSection}>
            <div className={styles.clinicTextBlock}>
              <Heading className={styles.clinicName}>{facilityName}</Heading>
              {clinicTagline ? <FormLabel className={styles.clinicTagline}>{clinicTagline}</FormLabel> : null}
            </div>
          </div>
        </div>

        <div className={styles.providerSection}>
          <Heading className={styles.providerName}>{providerName || t('provider', 'Provider')}</Heading>
          {providerSpecialty ? <FormLabel className={styles.providerLine}>{providerSpecialty}</FormLabel> : null}
          {providerQualification ? (
            <FormLabel className={styles.providerLine}>{providerQualification}</FormLabel>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default ErxPrintHeader;
