module.exports = function(app, passport) {
    app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }), function(req, res){});
    //app.get('/auth/twitter', passport.authenticate('twitter'));
    
    app.get('/auth/twitter/callback', //DON'T put an asterisk here
        passport.authenticate('twitter', {
            failureRedirect: '/' 
        }),
        function(req, res) {
            var user = req.user;
            var account = req.account;
        
            
            self.redirect('/success');
        }
    );
    
    app.get('/success', function(req, res) {
        res.send("Success!");
        res.end();
    })
}