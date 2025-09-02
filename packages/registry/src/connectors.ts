export type ConnectorKey = 'stripe' | 'open_banking' | 'hmrc' | 'twilio'

export type ConnectorStatus = 'active' | 'not_configured'

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function isOpenBankingConfigured(): boolean {
  return Boolean(process.env.OPEN_BANKING_CLIENT_ID && process.env.OPEN_BANKING_CLIENT_SECRET && String(process.env.OPEN_BANKING_ENV).toLowerCase() === 'sandbox')
}

export function isHmrcConfigured(): boolean {
  return Boolean(process.env.HMRC_CLIENT_ID && process.env.HMRC_CLIENT_SECRET && String(process.env.HMRC_ENVIRONMENT).toLowerCase() === 'sandbox' && process.env.HMRC_VRN)
}

export function isTwilioConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
}

export function connectorStatus(key: ConnectorKey): ConnectorStatus {
  switch (key) {
    case 'stripe':
      return isStripeConfigured() ? 'active' : 'not_configured'
    case 'open_banking':
      return isOpenBankingConfigured() ? 'active' : 'not_configured'
    case 'hmrc':
      return isHmrcConfigured() ? 'active' : 'not_configured'
    case 'twilio':
      return isTwilioConfigured() ? 'active' : 'not_configured'
  }
}
