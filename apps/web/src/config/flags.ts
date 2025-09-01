export const featureFlags = {
  PAYROLL_STUB: process.env.NEXA_FEATURE_PAYROLL_STUB !== 'false',
  OPEN_BANKING_STUB: process.env.NEXA_FEATURE_OPEN_BANKING_STUB !== 'false',
  MTD_VAT_STUB: process.env.NEXA_FEATURE_MTD_VAT_STUB !== 'false',
  WMS_ADV_STUB: process.env.NEXA_FEATURE_WMS_ADV_STUB !== 'false',
  CRM_DEEP_STUB: process.env.NEXA_FEATURE_CRM_DEEP_STUB !== 'false',
  MARKETPLACE_STUB: process.env.NEXA_FEATURE_MARKETPLACE_STUB !== 'false',
  BILLING_METERING_STUB: process.env.NEXA_FEATURE_BILLING_METERING_STUB !== 'false',
  MFG_ADV_STUB: process.env.NEXA_FEATURE_MFG_ADV_STUB !== 'false',
}



