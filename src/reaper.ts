import * as Heroku from 'heroku-client';
import * as moment from 'moment';
import * as logger from 'heroku-logger';

const heroku = new Heroku({ token: process.env.HEROKU_API_KEY });

const team = process.env.TEAM_NAME;
const daysLimit = process.env.DAYS_LIMIT;

if (!team || !daysLimit) {
    throw new Error('TEAM_NAME and DAYS_LIMIT must be defined');
}

(async () => {
    const apps = await heroku.get('/apps');    
    
    const toKill = apps
        .filter( app => app.team && app.team.name === team)
        .filter( app => moment().diff(moment(app.created_at), 'days') > parseInt(daysLimit))

    logger.info(`going to delete ${toKill.length} apps: ${toKill.map(app => app.name).join(',')}`);
    
    for (const app of toKill) {
        await heroku.delete(`/apps/${app.name}`);
    }
})();



