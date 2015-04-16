/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Adds the systems that shape your system
systems({
  'azkdemo-services': {
    // Dependent systems
    depends: ["mail", "redis"],
    // More images:  http://images.azk.io
    image: {"docker": "azukiapp/node:0.12"},
    // Steps to execute before running instances
    provision: [
      "npm install",
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: "npm start",
    wait: {"retry": 20, "timeout": 1000},
    mounts: {
      '/azk/#{manifest.dir}': path("."),
      '/azk/#{manifest.dir}/node_modules': persistent("#{system.name}-node_modules"),
    },
    scalable: {"default": 1},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    envs: {
      // set instances variables
      NODE_ENV: "dev",
    },
    export_envs: {
      // exports variables for dependent systems
      APP_URL: "#{system.name}.#{azk.default_domain}:#{net.port.http}",
    },
  },

  // Adds the "redis" system
  redis: {
    image: { docker: "redis" },
    export_envs: {
      "DATABASE_URL": "redis://#{net.host}:#{net.port[6379]}"
    },
    command: "redis-server --appendonly yes",
    mounts: {
      "/data": persistent("data"),
    },
  },

  // MailCatcher system
  mail: {
    // Dependent systems
    depends: [],
    // More images:  http://images.azk.io
    image: {"docker": "schickling/mailcatcher"},
    http: {
      domains: [
        "#{system.name}.azkdemo.#{azk.default_domain}",
      ],
    },
    ports: {
      // exports global variables
      http: "1080/tcp",
      smtp: "1025/tcp",
    },
  },

  // ngrok system
  ngrok: {
    // Dependent systems
    depends: ["azkdemo-services"],
    // More images:  http://images.azk.io
    image: {"docker": "azukiapp/ngrok:latest"},
    wait: {"retry": 20, "timeout": 1000},
    http: {
      domains: [
        "#{manifest.dir}-#{system.name}.#{azk.default_domain}",
      ],
    },
    ports: {
      // exports global variables
      http: "4040",
    },
    mounts: {
      '/ngrok/logs' : path("./logs"),
    },
    envs: {
      // set instances variables
      NGROK_CONFIG: "/ngrok/ngrok.yml",
      NGROK_LOG: "/ngrok/logs/ngrok.log",
    },
  },
});
