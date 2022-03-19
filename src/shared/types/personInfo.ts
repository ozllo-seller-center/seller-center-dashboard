export default class PersonInfo {
  isPF: boolean;

  firstName: string;

  lastName: string;

  cpf: string;

  birthday?: string;

  constructor(
    isPF: boolean,
    firstName: string,
    lastName: string,
    cpf: string,
    birthday?: string,
  ) {
    this.isPF = isPF;
    this.firstName = firstName;
    this.lastName = lastName;
    this.cpf = cpf;
    this.birthday = birthday;
  }
}
