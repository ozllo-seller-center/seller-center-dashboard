export default class CompanyInfo {
  isPJ: boolean;

  cnpj: string;

  name: string;

  razaoSocial: string;

  constructor(isPJ: boolean, cnpj: string, name: string, razaoSocial: string) {
    this.isPJ = isPJ;
    this.cnpj = cnpj;
    this.name = name;
    this.razaoSocial = razaoSocial;
  }
}
