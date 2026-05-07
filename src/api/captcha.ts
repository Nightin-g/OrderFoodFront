import api from './axios'

export const generateCaptcha = () => {
  return api.get('/captcha/generate', {
    responseType: 'blob'
  })
}

export const validateCaptcha = (captchaKey: string, captcha: string) => {
  return api.get('/captcha/validate', {
    params: { captchaKey, captcha }
  })
}