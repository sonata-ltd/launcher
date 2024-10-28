# Sonata Launcher
The next generation Minecraft Launcher
## The project is under heavy development
### Build the project

Fetch the source code
```
git clone https://github.com/Qeatrix/SonataLauncher.git
```

Build frontend
```
cd app && npm run build
```

Build ActionHandler
```
cd action_handler && cargo run build
```

## Project Todo
#### Action Handler
- [ ] Logger implementation
- [x] Different Java versions downloader
  - [x] Compare every Java downloaded path
  - [ ] Endpoint for Java download
  - [ ] WebSockets integration
- [ ] Refactor WebSocket messages types
    - [ ] Return Error type in send_ws_msg function
- [ ] Implement **natives** folder handling
- [ ] Separate endpoint for instance launching
- [ ] Code refactoring in `instance/mod.rs`
- [ ] Endpoint for sending of installed instances
	- [x] Instance directory initialization
 		- [x] Refactor `init_instance_dir` function
	- [x] Installed instances storing implementation in JSON
	- [ ] Async file system scan and files comparing implementation
	   - [ ] Check existing instance names
- [ ] Endpoint for sending required authenticated account
	- [ ] Storing authenticated accounts
#### Frontend
- [ ] Refactor WebSocket message types
- [ ] Instance download manager with WebSockets integration
  - [ ] Switching between percentage and elapsed downloading time
  - [ ] Correct `Cancel` button handling
  - [ ] Errors handling on download attempt
  - [ ] Fix scroll problem on window resizing
- [ ] Tasks widget on headerbar
	- [ ] Storage of minimized windows
- [ ] Retrieving installed instances
	- [x] Reusable grid display component
- [ ] Account authentication
- [ ] Refactor localization store
- [ ] Icon Browser
    - [ ] Import icons from system file picker
- [ ] File system scan indication
    - [ ] Different states
        - [ ] Awaiting launch
        - [ ] Running
        - [ ] Finish: problems detected or not
    - [ ] Problem resolution

## Application Architecture
![Application Architecture Map](./Application%20Architecture.png)
