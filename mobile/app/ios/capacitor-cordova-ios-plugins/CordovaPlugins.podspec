
  Pod::Spec.new do |s|
    s.name = 'CordovaPlugins'
    s.version = '1.0.0'
    s.summary = 'Autogenerated spec'
    s.license = 'Unknown'
    s.homepage = 'https://example.com'
    s.authors = { 'Capacitor Generator' => 'hi@example.com' }
    s.source = { :git => 'https://github.com/ionic-team/does-not-exist.git', :tag => '1.0.0' }
    s.source_files = 'sources/**/*.{swift,h,m,c,cc,mm,cpp}'
    s.ios.deployment_target  = '11.0'
    s.dependency 'CapacitorCordova'
    s.swift_version  = '4.0'
    s.frameworks = 'AssetsLibrary', 'MobileCoreServices', 'CoreGraphics'
  end