import { LoginPageComponent } from "./login/login.component";
import { AuthService } from "./services/auth.service";
import { AuthGuard } from "./guards/auth.guard";


export const authGuards: Array<any> = [
    AuthGuard
];

export const authComponents: Array<any> = [
    LoginPageComponent
];

export const authServices: Array<any> = [
    AuthService
];