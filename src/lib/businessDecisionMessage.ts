export type BusinessDecision = 'APPROVED' | 'DISAPPROVED';
export type BusinessDecisionLanguage = 'sw' | 'en';

type BusinessDecisionMessageInput = {
  decision: BusinessDecision;
  language: BusinessDecisionLanguage;
  ownerName: string;
  businessName: string;
  bundleName?: string;
  bundleDuration?: number;
  disapprovalReason?: string;
};

export function buildBusinessDecisionMessage({
  decision,
  language,
  ownerName,
  businessName,
  bundleName = '',
  bundleDuration = 0,
  disapprovalReason = '',
}: BusinessDecisionMessageInput) {
  if (language === 'en') {
    if (decision === 'APPROVED') {
      return `Congratulations ${ownerName}! We are pleased to let you know that your business "${businessName}" has been approved by Rafiki. You are now subscribed to the ${bundleName} bundle for ${bundleDuration} days. Please remember to renew your bundle after ${bundleDuration} days so your service can continue without interruption. Thank you for choosing Rafiki. Welcome to Rafiki! Rafiki Connecting You With Your Customers!`;
    }
    return `Dear ${ownerName}, we regret to inform you that your business application for "${businessName}" has not been approved at this time. Reason: ${disapprovalReason}. You are welcome to correct the information and submit your application again. Please call 0736333111 or WhatsApp 0799100500 so we can assist you further. Thank you for your understanding. Welcome to Rafiki! Rafiki Connecting You With Your Customers!`;
  }

  if (decision === 'APPROVED') {
    return `Hongera ${ownerName}! Kwa furaha tunakujulisha kuwa biashara yako "${businessName}" imeidhinishwa na Rafiki. Umejiunga na kifurushi ${bundleName} cha siku ${bundleDuration}. Tafadhali kumbuka kuhuisha kifurushi chako baada ya siku ${bundleDuration} ili huduma iendelee bila kukatizwa. Asante kwa kuchagua Rafiki. Karibu Rafiki! Rafiki Tunakuunganisha Na wateja wako!`;
  }
  return `Ndugu ${ownerName}, tunasikitika kukujulisha kuwa ombi la biashara yako "${businessName}" halijaidhinishwa kwa sasa. Sababu: ${disapprovalReason}. Tunakukaribisha kurekebisha taarifa hizo na kuwasilisha ombi lako tena. Tafadhali wasiliana nasi kwa simu 0736333111 au WhatsApp 0799100500 ili tukusaidie zaidi. Asante kwa kuelewa. Karibu Rafiki! Rafiki Tunakuunganisha Na wateja wako!`;
}
