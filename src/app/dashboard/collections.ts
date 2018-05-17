import { MessagesService } from './services/messages.service';
import { GroupsService } from "./services/groups.service";

export const dashboardGuards: Array<any> = [
    
];

export const dashboardComponents: Array<any> = [

];

export const dashboardServices: Array<any> = [
    GroupsService,
    MessagesService
];