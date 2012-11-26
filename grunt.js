var JSHINT_NODE = {
  node: true,
  es5: true
};

var LINT_OPTIONS = {
  quotmark: 'single',
  camelcase: true,
  strict: true,
  trailing: true,
  curly: true,
  eqeqeq: true,
  immed: true,
  latedef: true,
  newcap: true,
  noarg: true,
  sub: true,
  undef: true,
  boss: true
};

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    files: {
      lib: ['lib/*.js'],
      test: ['test/*_test.js']
    },
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    lint: {
      lib: '<config:files.lib>',
      test: '<config:files.test>'
    },    

    test: {
      lib: '<config:files.test>'
    },

    jshint: {
      lib: {
        options: JSHINT_NODE
      },
      test: {
        options: JSHINT_NODE
      },
      options: LINT_OPTIONS,
      globals: {}
    }
  });

  grunt.registerTask('default', 'lint test');
};