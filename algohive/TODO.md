# TODO

## Frontend

### Home

- [x] Display the roles (probably preload them)

### Catalogs

- [x] Add a little description, or a button to briefly explain what is a catalog and a puzzle and what to expect from it

### Scopes

- [x] Preload the Groups in order to display them correctly in the ScopesDetails

### Users

- [ ] Prevent the owner to delete its own account
- [ ] Prevent a staff to delete a group if it has users
- [ ] Plug the Reset password for the users
- [ ] Plug the Reset password for the staff
- [ ] Add traduction for "staffTabs.users.noUsersInGroup"
- [ ] Put back the toast
- [ ] Let only the possibility to BLOCK a staff only to the owner
- [ ] Remove the possibility for the owner to block himself
- [ ] AutoSelect when there are only one choice per select

### Roles

- [x] Display the scopes and users having the role (probably preload them)

### Competitions

- [ ] Refresh the view details when toggling the visibility and the finished status
- [ ] Don't hide the "Finish" button when the competition is finished, display a "Reopen" button instead
- [ ] Fix the display for participating groups / users
- [ ] Fix the search icon bar

### Login

- [ ] Display a message when the user is blocked
- [ ] Display a message when the user is not "activated" (no roles no groups)

## Backend

- [x] Remove any trailing log.print
- [ ] Rewrite the hasPermissions<ToDoSo> functions
- [ ] Write the JOIN with GORM instead of RAW SQL
- [ ] Document the whole API organization
