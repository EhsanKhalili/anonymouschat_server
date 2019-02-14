module.exports = allowedRolesArray => {
   return (req, res, next) => {
      for (let allowedRoleIndex in allowedRolesArray) {
         if (req.user.roles.indexOf(allowedRolesArray[allowedRoleIndex]) === -1) {
            return res.status(403).send('Access denied.');
         }
      }

      next();
   };
};
