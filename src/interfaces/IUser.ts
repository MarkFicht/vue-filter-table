export interface IUser {
    id: number;
    name: String;
    username: String;
    email: String;
    address: IAddress;
    phone: String;
    website: String;
    company: ICompany;
}

export interface IAddress {
    street: String;
    suite: String;
    city: String;
    zipcode: String;
    geo: {
        lat: String;
        lng: String;
    };
}

export interface ICompany {
    name: String;
    catchPhrase: String;
    bs: String;
}
