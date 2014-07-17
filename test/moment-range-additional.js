'use strict';

var moment = require('moment-range');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

function range(r){
  return moment.range(r);
}

var testCounter = 1;

function check(a, b){

  console.log("---TEST--- %d",testCounter++);

  if(!a && !b){
    return true;
  }
  if(!a || !b){
    return false;
  }

  var backup = a;
  a = a.toList();

  if(a.length !== b.length){
    console.log("Failed: \n------");
    console.log(backup.toString());
    console.log(b);
    console.log(":::ActualLength:" + a.length);
    console.log(":::ExpectedLength:" + b.length);
    return false;
  }

  for(var i = 0; i < a.length; a++){
    if(a[i].start.format() !== b[i].start){
      console.log("Failed: \n------");
      console.log(":::Actual:" + a[i].start.format());
      console.log(":::Expected:" + b[i].start);
      return false;
    }
    if(a[i].end.format() !== b[i].end){
      console.log("Failed: \n------");
      console.log(":::Actual:" + a[i].end.format());
      console.log(":::Expected:" + b[i].end);
      return false;
    }
  }

  return true;
}

function time(a, e){
  return e ? moment(Date.parse(a)).utc().add(1, 'year').subtract(1, 's').format() : moment(Date.parse(a)).utc().format();
}

exports['selector range'] = {
  "1" : function(test) {
    test.expect(1);

    test.equal(check(range('(1990>>2001)'),
    [{
      start: time('1990'),
      end: time('2001', true),
    }]), true);

    test.done();
  },
  "2" : function(test) {
    test.expect(1);

    test.equal(check(range('(1990>>2001)(2005>>2008)'),
    [{
      start: time('1990'),
      end: time('2001', true),
    },{
      start: time('2005'),
      end: time('2008', true),
    }]), true);

    test.done();
  },
  "3" : function(test) {
    test.expect(1);

    test.equal(check(range('(1990>>2000)(1980>>2050)(2060>>2080)(^2055>>2057)'),
    [{
      start: time('1980'),
      end: time('2050', true),
    },{
      start: time('2057', true),
      end: time('2080', true),
    }]), true);

    test.done();
  },
  "4" : function(test) {
    test.expect(1);

    test.equal(check(range('(2055>>2070)(^2055>>2070)'),
    []), true);

    test.done();
  },
  "5" : function(test) {
    test.expect(1);

    test.equal(check(range('(^2055>>2070)(2055>>2070)(^2055>>2070)(2055>>2070)'),
    [{
      start : time("2055"),
      end : time("2070", true),
    }]), true);

    test.done();
  },
  "6" : function(test) {
    test.expect(1);

    test.equal(check(range('(2055>>2070)(^2055>>2070)(2055>>2070)(^2055>>2070)'),
    []), true);

    test.done();
  },
  "7" : function(test) {
    test.expect(1);

    test.equal(check(range('(1990>>2000)(1950>>2050)(^1950>>2050)'),
    []), true);

    test.done();
  },
  "8" : function(test) {
    test.expect(1);

    test.equal(check(range('(1990>>2000)(2010>>2050)(^1985>>2025)'),
    [{
      start : time("2026"),
      end : time("2050", true),
    }]), true);

    test.done();
  },
  "9" : function(test) {
    test.expect(1);

    test.equal(check(range('(1990>>2000)(2010>>2050)(2070>>2080)(^1985>>2065)'),
    [{
      start : time("2070"),
      end : time("2080", true),
    }]), true);

    test.done();
  },
  "10" : function(test) {

    test.expect(1);

    test.equal(check(range('(1990>>2000)(2010>>2050)(^2010>>2050)(2002>>2005)(^1985>>2001)'),
    [{
      start : time("2002"),
      end : time("2005", true),
    }]), true);

    test.done();
  },
  "11" : function(test) {

    test.expect(1);

    test.equal(check(range('(1990>>2000)(2010>>2050)(2080>>2090)(2100>>2200)(^1985>>2095)'),
    [{
      start : time("2100"),
      end : time("2200", true),
    }]), true);

    test.done();
  },
  "12" : function(test) {

    test.expect(1);

    test.equal(check(range('(1990>>2000)(2010>>2050)(2080>>2090)(2100>>2200)(^1995>>2300)'),
    [{
      start : time("1990"),
      end : time("1994", true),
    }]), true);

    test.done();
  },
  "13" : function(test) {

    test.expect(1);

    test.equal(check(range('(1990>>2000)(2010>>2050)(2080>>2090)(2100>>2200)(^1980>>2150)'),
    [{
      start : time("2151"),
      end : time("2200", true),
    }]), true);

    test.done();
  },
  "14" : function(test) {

    test.expect(1);

    test.equal(check(range('(1990>>2000)(2010>>2050)(2080>>2090)(2100>>2200)(^1980>>1995)'),
    [{
      start : time("1996"),
      end : time("2000", true),
    },{
      start : time("2010"),
      end : time("2050", true),
    }, {
      start : time("2080"),
      end : time("2090", true),
    }, {
      start : time("2100"),
      end : time("2200", true),
    }]), true);

    test.done();
  },
  "15" : function(test) {

    test.expect(1);

    test.equal(check(range('(1990>>2000)(1995>>2050)(2080>>2090)(2100>>2200)(^2150>>2300)'),
    [{
      start : time("1990"),
      end : time("2050", true),
    }, {
      start : time("2080"),
      end : time("2090", true),
    }, {
      start : time("2100"),
      end : time("2149", true),
    }]), true);

    test.done();
  }
};
