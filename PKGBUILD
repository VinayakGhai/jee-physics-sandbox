# Maintainer: Vinayak Ghai <VinayakGhai@users.noreply.github.com>
pkgname=jee-physics-sandbox-bin
_pkgname=jee-physics-sandbox
pkgver=1.0.0
pkgrel=1
pkgdesc="Interactive JEE Physics Simulation Engine & AI Studio"
arch=('x86_64')
url="https://github.com/VinayakGhai/jee-physics-sandbox"
license=('GPL2')
depends=('gtk3' 'nss' 'alsa-lib' 'libxss' 'glibc')
makedepends=('npm' 'git')
provides=('jee-physics-sandbox')
conflicts=('jee-physics-sandbox')
source=("${url}/releases/download/v${pkgver}/JEE-Physics-Sandbox-${pkgver}-x86_64.AppImage")
sha256sums=('SKIP')

package() {
    install -Dm755 "${srcdir}/JEE-Physics-Sandbox-${pkgver}-x86_64.AppImage" "${pkgdir}/usr/bin/${_pkgname}"
}
