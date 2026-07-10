import type { Application } from '../../declarations.js';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';

const ROUTE = '/api/v1/auth';

export default (app: Application) => {
    app.set('authentication', {
        secret: process.env.JWT_SECRET ?? '000000',
        authStrategies: ['jwt', 'local'],
        entity: 'user',
        service: '/api/v1/users',
        local: {
            usernameField: 'email',
            passwordField: 'password',
            errorMessage: 'Authentication failed',
        },
        jwtOptions: {
            expiresIn: '30d',
            audience: "visual-qa-console",
            issuer: "visual-qa-console",
        },
    });
    const service = new AuthenticationService(app);

    service.register('jwt', new JWTStrategy());
    service.register('local', new LocalStrategy());

    app.use(ROUTE, service);
};
