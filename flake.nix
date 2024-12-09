{
    inputs = {
        nixpkgs.url = "nixpkgs";
    };

  outputs = { self, nixpkgs, ... }:
    let
      pkgsFor = system:
        import nixpkgs {
          inherit system;
          overlays = [ ];
        };

      targetSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
    in {
      devShells = nixpkgs.lib.genAttrs targetSystems (system:
        let pkgs = pkgsFor system;
        in {
          default = pkgs.mkShell rec {
            nativeBuildInputs = with pkgs; [
              # Compilers
              cargo
              rustc

              # Runtime
              nodejs

              # Utils
              git
            ];

            # Env Vars
            LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath nativeBuildInputs}";
          };
        });
    };
}
