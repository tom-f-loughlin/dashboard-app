export interface Company {
    name: string;
    catchPhrase: string;
    bs: string;
};

export interface Address {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: GeoCode;
};

export interface GeoCode {
    lat: string;
    lng: string;
};

export interface UserData {
    id: number;
    name: string;
    username: string;
    email: string;
    address: any;
    phone: string;
    website: string;
    company: Company;
};