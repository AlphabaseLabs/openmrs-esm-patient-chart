import React from 'react';
import { FormLabel } from '@carbon/react';
import styles from './erx-print.scss';

interface ErxPrintFooterProps {
  showDisclaimer: boolean;
  disclaimer: string;
  footerDetails: string;
}

const ErxPrintFooter: React.FC<ErxPrintFooterProps> = ({ showDisclaimer, disclaimer, footerDetails }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {showDisclaimer && disclaimer ? <FormLabel className={styles.footerDisclaimer}>{disclaimer}</FormLabel> : null}
        <FormLabel className={styles.footerDetails}>{footerDetails}</FormLabel>
      </div>
    </footer>
  );
};

export default ErxPrintFooter;
