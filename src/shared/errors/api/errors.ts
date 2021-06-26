//
//     Errors
//

import { errorCode } from './errorCode'

/**
 * Define Interface AppError
 */
export type AppError = {
  errorCode: errorCode
  description: string
  tip: string
  example?: string[]
}

/**
 * NEVER USE
 */
export const voidError: AppError = {
  errorCode: 0x000,
  description: 'It should never happen, call a developer.',
  tip: 'Miss developed.',
  example: ['Do not use.']
}

/**
 * ERROR - Login Fail
 */
export const loginFail: AppError = {
  errorCode: 0x001,
  description: 'Credentials invalid.',
  tip: 'Check your login and password.',
  example: [
    `{
            \'login\': \'Your Login\',
            \'password\': \'Your Passwor\'
        }`
  ]
}

/**
 * ERROR - Invalid Email
 */
export const invalidEmail: AppError = {
  errorCode: 0x002,
  description: 'Email inválido.',
  tip: 'Cheque o campo de e-mail.',
  example: [
    `example@mail.com`
  ]
}

/**
 * ERROR - Invalid Paswword
 */
export const invalidPassword: AppError = {
  errorCode: 0x003,
  description: 'Senha inválida.',
  tip: 'Cheque o campo de senha, ela deve ser uma senha forte.',
  example: [
    `
        A senha deve conter pelo menos 8 caracteres.
        \nA senha ter pelo menos uma letra maiúscula.
        \nA senha ter pelo menos uma letra minúscula.
        \nA senha ter pelo menos um número.
        \nA senha ter pelo menos um caracter especial.
         `
  ]
}

/**
 * ERROR - User already exists
 */
export const userExists: AppError = {
  errorCode: 0x004,
  description: 'Usuário já existe.',
  tip: 'Tente realizar o login ou recuperar sua senha.',
  example: [``]
}

/**
 * ERROR - User does not exists
 */
export const userNotExists: AppError = {
  errorCode: 0x005,
  description: 'Usuário não existe.',
  tip: 'Cheque o e-mail informado.',
  example: [``]
}

/**
 * ERROR - Invalid Activation Token
 */
export const invalidActivationToken: AppError = {
  errorCode: 0x006,
  description: 'Token de ativação inválido.',
  tip: 'Cheque seu e-mail e entre com a URL de verificação.',
  example: [``]
}

/**
 * ERROR - Invalid User Reference
 */
export const invalidUserReference: AppError = {
  errorCode: 0x007,
  description: 'Usuário inválido.',
  tip: 'O usuário passado como referência é inválido. Cheque seu ID de referência para realizar uma requisição.',
  example: [``]
}

/**
 * ERROR - Invalid First Name
 */
export const invalidFirstName: AppError = {
  errorCode: 0x008,
  description: 'Nome inválido.',
  tip: 'Cheque o cmapo de nome.',
  example: [`
        O nome deve conter pelo menos 2 caracteres.
    `]
}

/**
 * ERROR - Invalid Last Name
 */
export const invalidLastName: AppError = {
  errorCode: 0x009,
  description: 'Sobrenome inválido.',
  tip: 'Check last name field.',
  example: [`
        The last name is at least 2 characters long.
    `]
}

/**
 * ERROR - Invalid CPF
 */
export const invalidCPF: AppError = {
  errorCode: 16,
  description: 'CPF inválido.',
  tip: 'Cheque o campo de CPF.',
  example: [`
        Deve-se informar um registro valido de CPF.
    `]
}

/**
 * ERROR - Invalid CPF
 */
export const invalidRG: AppError = {
  errorCode: 12,
  description: 'RG é inválido.',
  tip: 'Cheque o campo de RG.',
  example: [`
        O RG deve conter pelo menos 2 caracteres.
    `]
}

/**
 * ERROR - Invalid Birthday
 */
export const invalidBirthday: AppError = {
  errorCode: 10,
  description: 'Data de nascimento inválida.',
  tip: 'Cheque o campo de data de nascimento.',
  example: [`
        01/01/1970
    `]
}

/**
 * ERROR - Invalid CEP
 */
export const invalidCEP: AppError = {
  errorCode: 0x00C,
  description: 'CEP é inválido.',
  tip: 'Cheque o campo de CEP.',
  example: [`
        O CEP deve conter 7 caracteres.
    `]
}

/**
 * ERROR - Invalid Address
 */
export const invalidAddress: AppError = {
  errorCode: 0x00D,
  description: 'Endereço é inválido.',
  tip: 'Cheque o campo de endereço.',
  example: [`
        O endereço deve conter pelo menos 2 caracteres.
    `]
}

/**
 * ERROR - Invalid City
 */
export const invalidCity: AppError = {
  errorCode: 0x00E,
  description: 'Cidade é inválida.',
  tip: 'Cheque o campo de cidade.',
  example: [`
        A cidade deve conter pelo menos 2 caracteres.
    `]
}

/**
 * ERROR - Invalid Complement
 */
export const invalidComplement: AppError = {
  errorCode: 0x00F,
  description: 'Complemento é inválido.',
  tip: 'Cheque o campo de complemento.',
  example: [`
        O complemento deve conter pelo menos 4 caracteres.
        O complemento deve conter no máximo 24 caracteres.
    `]
}

/**
 * ERROR - Invalid District
 */
export const invalidDistrict: AppError = {
  errorCode: 0x010,
  description: 'Bairro é inválido.',
  tip: 'Cheque o campo de bairro.',
  example: [`
        O bairro deve conter pelo menos 2 caractres
    `]
}

/**
 * ERROR - Invalid Address Number
 */
export const invalidAddressNumber: AppError = {
  errorCode: 0x011,
  description: 'Número de endereço é inválido.',
  tip: 'Cheque o campo de número de endereço.',
  example: [`
        O número de endereço deve ter pelo menos 1 digito.
    `]
}

/**
 * ERROR - Invalid CNPJ
 */
export const invalidCNPJ: AppError = {
  errorCode: 0x012,
  description: 'CNPJ é inválido.',
  tip: 'Cheque o campo de CNPJ.',
  example: [`
        Deve-se possuir um CNPJ válido para o cadastro.
        \nO CNPJ deve ter pelo 14 digitos.
    `]
}

/**
 * ERROR - Invalid Shop name
 */
export const invalidShopName: AppError = {
  errorCode: 0x013,
  description: 'Nome da loja é inválido.',
  tip: 'Cheque o campo de nome da loja.',
  example: [`
        O nome da loja deve conter pelo menos 2 caracteres.
    `]
}

/**
 * ERROR - Invalid Bank Code
 */
export const invalidBankCode: AppError = {
  errorCode: 0x014,
  description: 'Código de banco inválido.',
  tip: 'Cheque o campo de bawnco.',
  example: [`
        O código de banco informado não existe.
    `]
}

/**
 * ERROR - Invalid Account
 */
export const invalidAccount: AppError = {
  errorCode: 0x015,
  description: 'Conta bancária inválida.',
  tip: 'Cheque o campo de conta.',
  example: [`
      A conta deve conter pelo menos 2 digitos.
    `]
}

/**
 * ERROR - Invalid Agency Number
 */
export const invalidAgency: AppError = {
  errorCode: 0x016,
  description: 'Agência bancária inválida.',
  tip: 'Cheque o campo de agência.',
  example: [`
        A agência deve conter pelo menos 2 digitos.
    `]
}


/**
 * ERROR - Invalid Product
 */
export const invalidProduct: AppError = {
  errorCode: 0x016,
  description: 'Produto é inválido.',
  tip: 'Cheque as informações.',
  example: [`
        Product invalid.
    `]
}

/**
 * Lista com todos os erros relacionados a Client
 */
export const errorsList: AppError[] = [
  loginFail,
  invalidEmail,
  invalidPassword,
  userExists,
  userNotExists,
  invalidActivationToken,
  invalidUserReference,
  invalidFirstName,
  invalidLastName,
  invalidCPF,
  invalidRG,
  invalidBirthday,
  invalidCEP,
  invalidAddress,
  invalidCity,
  invalidComplement,
  invalidDistrict,
  invalidAddressNumber,
  invalidCNPJ,
  invalidShopName,
  invalidBankCode,
  invalidAccount,
  invalidAgency,
  invalidProduct
]


/**
 * Retorna um error object dependendo do código referenciado
 *
 * @param errorCode
 */
export const findError = (errorCode: errorCode) => {
  console.log(`Error CPF: ${errorCode}`)
  return errorsList.find(error => error.errorCode === errorCode) || voidError
}


const errorField = [
  { errorCode: 0x001, errorField: 'email' },
  { errorCode: 0x002, errorField: 'email' },
  { errorCode: 0x003, errorField: 'password' },
  { errorCode: 0x004, errorField: '' },
  { errorCode: 0x005, errorField: 'email' },
  { errorCode: 0x006, errorField: '' },
  { errorCode: 0x007, errorField: 'email' },
  { errorCode: 0x008, errorField: 'personalInfo.firstName' },
  { errorCode: 0x009, errorField: 'personalInfo.lastName' },
  { errorCode: 16, errorField: 'personalInfo.cpf' },
  { errorCode: 12, errorField: 'personalInfo.rg' },
  { errorCode: 10, errorField: 'personalInfo.birthday' },
  { errorCode: 0x00C, errorField: 'address.cep' },
  { errorCode: 0x00D, errorField: 'address.address' },
  { errorCode: 0x00E, errorField: 'address.city' },
  { errorCode: 0x00F, errorField: 'address.complement' },
  { errorCode: 0x010, errorField: 'address.district' },
  { errorCode: 0x011, errorField: 'address.number' },
  { errorCode: 0x012, errorField: 'personalInfo.cnpj' },
  { errorCode: 0x013, errorField: 'shopInfo.name' },
  { errorCode: 0x014, errorField: 'bankInfo.bank' },
  { errorCode: 0x015, errorField: 'bankInfo.account' },
  { errorCode: 0x016, errorField: 'bankInfo.agency' },
]

export const getErrorField = (errorCode: errorCode) => {
  return errorField.find(error => error.errorCode === errorCode) || ''
}
