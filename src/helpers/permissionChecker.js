import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const roles = JSON.parse(readFileSync(path.join(__dirname, '../config/roles.json'), 'utf8'));


export class PermissionChecker {
    static getUserLevel(user, guild) {
        const member = guild?.members.cache.get(user.id);
        
        // Check owner
        if (roles.permissions.owner.users.includes(user.id)) {
            return { level: 10, role: 'owner' };
        }
        
        if (!member) return { level: 0, role: 'user' };
        
        let highestLevel = 0;
        let userRole = 'user';
        
        // Check role-based permissions
        for (const [roleName, config] of Object.entries(roles.permissions)) {
            if (roleName === 'owner') continue;
            
            const hasRole = config.roles?.some(roleName => 
                member.roles.cache.some(role => role.name === roleName)
            );
            
            if (hasRole && config.level > highestLevel) {
                highestLevel = config.level;
                userRole = roleName;
            }
        }
        
        return { level: highestLevel, role: userRole };
    }
    
    static hasPermission(user, guild, command) {
        const userLevel = this.getUserLevel(user, guild);
        const roleConfig = roles.permissions[userLevel.role];
        
        if (!roleConfig) return false;
        if (roleConfig.permissions.includes('*')) return true;
        if (roleConfig.permissions.includes(command)) return true;
        
        return false;
    }
    
    static getRequiredLevel(command) {
        for (const [roleName, config] of Object.entries(roles.permissions)) {
            if (config.permissions.includes(command) || config.permissions.includes('*')) {
                return config.level;
            }
        }
        return 0;
    }
}