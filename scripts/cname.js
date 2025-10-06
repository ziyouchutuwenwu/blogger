'use strict';
hexo.extend.generator.register('cname', function(locals){
  return {
    path: 'CNAME',
    data: 'hanjiangxue.uk'
  };
});
