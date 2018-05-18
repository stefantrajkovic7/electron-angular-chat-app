import { LoginComponent } from "./login/login.component";
import { AuthService } from "./services/auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { MessagesService } from "../dashboard/services/messages.service";
import { GroupsService } from "../dashboard/services/groups.service";


export const authGuards: Array<any> = [
    AuthGuard
];

export const authComponents: Array<any> = [
    LoginComponent
];

export const authServices: Array<any> = [
    AuthService,
    MessagesService,
    GroupsService
];