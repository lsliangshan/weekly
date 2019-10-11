export default {
  methods: {
    $exec (commandData) {
      if (commandData.data) {
        commandData.data = Object.assign({
          id: this.$getUUID()
        }, commandData.data)
      } else {
        commandData.data = {
          id: this.$getUUID()
        }
      }
      this.$socket.emit('exec', commandData)
    },
    __S4 () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    },
    $getUUID (prefix) {
      return ((prefix || '') + this.__S4() + this.__S4() + '-' + this.__S4() + '-' + this.__S4() + '-' + this.__S4() + '-' + this.__S4() + this.__S4() + this.__S4())
    },
    $throttle (fn, delay) {
      let timer = null,
        remaining = 0,
        previous = new Date();
      console.log('msg')
      return function () {
        let now = new Date(),
          remaining = now - previous,
          args = arguments,
          context = this;

        if (remaining >= delay) {
          if (timer) {
            clearTimeout(timer);
          }

          fn.apply(context, args);
          previous = now;
        } else {
          if (!timer) {
            timer = setTimeout(function () {
              fn.apply(context, args);
              previous = new Date();
            }, delay - remaining);
          }
        }
      };
    },
    $debounce (fn, delay) {
      let timer = null;

      return function () {
        let args = arguments;
        let context = this;

        if (timer) {
          clearTimeout(timer);

          timer = setTimeout(function () {
            fn.apply(context, args);
          }, delay);
        } else {
          timer = setTimeout(function () {
            fn.apply(context, args);
          }, delay);
        }
      }
    }
  }
}