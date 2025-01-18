'use strict';

module.exports = function(Member) {
  // Custom validation before saving a Member
  Member.observe('before save', function(ctx, next) {
    const teamId = ctx.instance ? ctx.instance.teamId : ctx.data.teamId;

    if (teamId) {
      Member.app.models.Team.findById(teamId, function(err, team) {
        if (err) {
          return next(err); // Handle any errors in the database query
        }

        if (!team) {
          const error = new Error(`Team with id ${teamId} does not exist.`);
          error.statusCode = 400;
          return next(error); // Prevent the Member from being saved
        }

        next(); // Continue with saving the Member if the teamId is valid
      });
    } else {
      next(); // Proceed if no teamId is inexist
    }
  });
};
