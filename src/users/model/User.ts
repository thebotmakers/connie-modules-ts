import { IFacebookPageScopedProfile } from '../../facebook';

export class User {
    connieId: string; 
    fbId:string;
    firstName: string;
    lastName: string;
    facebookPageScopedProfile: IFacebookPageScopedProfile;
    custom: any;
}