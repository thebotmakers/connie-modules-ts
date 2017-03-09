import { IAddress, IIdentity } from 'botbuilder';
import { IFacebookPageScopedProfile } from '../../facebook';

export class User implements IIdentity {

    connieId:string;
    
    // IIdentity
    id: string;
    name:string;

    firstName: string;
    lastName: string;
    
    locale:string;

    addresses: { [key: string]: IAddress } = {}

    facebookPageScopedProfile: IFacebookPageScopedProfile;

    custom: any;
}