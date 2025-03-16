# TODO

## Frontend

### Home

- [x] Display the roles (probably preload them)

### Catalogs

- [x] Add a little description, or a button to briefly explain what is a catalog and a puzzle and what to expect from it

### Scopes

- [x] Preload the Groups in order to display them correctly in the ScopesDetails
- [ ] Plug the catalogs update on Scope update
- [x] Block user from deleting scope if groups are under

### Groups

- [x] Prevent a staff to delete a group if it has users

### Users

- [x] Prevent the owner to delete its own account
- [x] Plug the Reset password for the users
- [x] Plug the Reset password for the staff
- [x] Add traduction for "staffTabs.users.noUsersInGroup"
- [x] Put back the toast
- [x] Let only the possibility to BLOCK a staff only to the owner
- [x] Remove the possibility for the owner to block himself
- [x] AutoSelect when there are only one choice per select
- [x] Do not display the ID on view details roles (Owner)
- [x] staffTabs.users.confirmations.deleteUser edit traduction
- [ ] Plug the edit user (students)

### Roles

- [x] Display the scopes and users having the role (probably preload them)
- [ ] Plug the scopes update on roles update

### Competitions

- [ ] Refresh the view details when toggling the visibility and the finished status
- [x] Don't hide the "Finish" button when the competition is finished, display a "Reopen" button instead
- [ ] Fix the display for participating groups / users
- [x] Fix the search icon bar
- [x] Plug the delete button
- [ ] Owner has to be able to select a scope before creating a competition
- [x] commmon.selects.themes to change / translate
- [x] Remove double title

### Misc

- [x] Do something when the user is blocked
- [ ] Display a message when the user is not "activated" (no roles no groups)

## Backend

- [x] Remove any trailing log.print
- [ ] Rewrite the hasPermissions<ToDoSo> functions
- [ ] Write the JOIN with GORM instead of RAW SQL
- [ ] Document the whole API organization
