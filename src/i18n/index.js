import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
/*import frCommon from './locales/fr/common.json';
import deCommon from './locales/de/common.json';

import enRecycling from './locales/en/recycling.json';
import frRecycling from './locales/fr/recycling.json';
import deRecycling from './locales/de/recycling.json';
*/
import enCalculator from './locales/en/calculator.json';
/*import frCalculator from './locales/fr/calculator.json';
import deCalculator from './locales/de/calculator.json';

import enContact from './locales/en/contact.json';
import frContact from './locales/fr/contact.json';
import deContact from './locales/de/contact.json';
*/
import enEquipementOverview from './locales/en/equipementOverview.json';
/*import frEquipementOverview from './locales/fr/equipementOverview.json';
import deEquipementOverview from './locales/de/equipementOverview.json';

import enHome from './locales/en/home.json';
import frHome from './locales/fr/home.json';
import deHome from './locales/de/home.json';

import enNotFound from './locales/en/notFound.json';
import frNotFound from './locales/fr/notFound.json';
import deNotFound from './locales/de/notFound.json';

import enOurLab from './locales/en/ourLab.json';
import frOurLab from './locales/fr/ourLab.json';
import deOurLab from './locales/de/ourLab.json';
*/
import enProductionChain from './locales/en/productionChain.json';
/*import frProductionChain from './locales/fr/productionChain.json';
import deProductionChain from './locales/de/productionChain.json';
*/
import enRecyclingProcess from './locales/en/recyclingProcess.json';
/*import frRecyclingProcess from './locales/fr/recyclingProcess.json';
import deRecyclingProcess from './locales/de/recyclingProcess.json';

import enReferences from './locales/en/references.json';
import frReferences from './locales/fr/references.json';
import deReferences from './locales/de/references.json';

import enSetupBuilder from './locales/en/setupBuilder.json';
import frSetupBuilder from './locales/fr/setupBuilder.json';
import deSetupBuilder from './locales/de/setupBuilder.json';
import EquipmentOverview from '../pages/EquipmentOverview';
*/

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        //recycling: enRecycling,
        calculator: enCalculator,
        //contact: enContact,
        equipmentOverview: enEquipementOverview,
        /*home: enHome,
        notFound: enNotFound,
        ourLab: enOurLab,*/
        productionChain: enProductionChain,
        recyclingProcess: enRecyclingProcess,
        /*references: enReferences,
        setupBuilder: enSetupBuilder
      */
      },
      /*
      fr: {
        common: frCommon,
        recycling: frRecycling,
        calculator: frCalculator,
        contact: frContact,
        equipmentOverview: frEquipementOverview,
        home: frHome,
        notFound: frNotFound,
        ourLab: frOurLab,
        productionChain: frProductionChain,
        recyclingProcess: frRecyclingProcess,
        references: frReferences,
        setupBuilder: frSetupBuilder
      },
      de: {
        common: deCommon,
        recycling: deRecycling,
        calculator: deCalculator,
        contact: deContact,
        equipmentOverview: deEquipementOverview,
        home: deHome,
        notFound: deNotFound,
        ourLab: deOurLab,
        productionChain: deProductionChain,
        recyclingProcess: deRecyclingProcess,
        references: deReferences,
        setupBuilder: deSetupBuilder
      },*/
    },

    lng: 'en',
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;