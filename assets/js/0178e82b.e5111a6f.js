"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[782],{34139:function(e){e.exports=JSON.parse('{"functions":[{"name":"useDeltaTime","desc":":::info Topologically-aware function\\nThis function is only usable if called within the context of [`Loop:begin`](/api/Loop#begin).\\n:::\\n\\nReturns the `os.clock()` time delta between the start of this and last frame.","params":[],"returns":[],"function_type":"static","source":{"line":13,"path":"lib/hooks/useDeltaTime.lua"}},{"name":"useEvent","desc":":::info Topologically-aware function\\nThis function is only usable if called within the context of [`Loop:begin`](/api/Loop#begin).\\n:::\\n\\nCollects events that fire during the frame and allows iteration over event arguments.\\n\\n```lua\\nfor _, player in ipairs(Players:GetPlayers()) do\\n\\tfor i, character in useEvent(player, \\"CharacterAdded\\") do\\n\\t\\tworld:spawn(\\n\\t\\t\\tComponents.Target(),\\n\\t\\t\\tComponents.Model({\\n\\t\\t\\t\\tmodel = character,\\n\\t\\t\\t})\\n\\t\\t)\\n\\tend\\nend\\n```\\n\\nReturns an iterator function that returns an ever-increasing number, starting at 1, followed by any event arguments\\nfrom the specified event.\\n\\nEvents are returned in the order that they were fired.\\n\\n:::caution\\n`useEvent` keys storage uniquely identified by **the script and line number** `useEvent` was called from, and the\\nfirst parameter (instance). If the second parameter, `event`, is not equal to the event passed in for this unique\\nstorage last frame, the old event is disconnected from and the new one is connected in its place.\\n\\nTl;dr: on a given line, you should hard-code a single event to connect to. Do not dynamically change the event with\\na variable. Dynamically changing the first parameter (instance) is fine.\\n\\n```lua\\nfor _, instance in pairs(someTable) do\\n\\tfor i, arg1, arg2 in useEvent(instance, \\"Touched\\") do -- This is ok\\n\\n\\tend\\nend\\n\\nfor _, instance in pairs(someTable) do\\n\\tlocal event = getEventSomehow()\\n\\tfor i, arg1, arg2 in useEvent(instance, event) do -- PANIC! This is NOT OK\\n\\n\\tend\\nend\\n```\\n:::\\n\\nIf `useEvent` ceases to be called on the same line with the same instance and event, the event connection is\\ndisconnected from automatically.\\n\\nYou can also pass the actual event object instead of its name as the second parameter:\\n\\n```lua\\nuseEvent(instance, instance.Touched)\\n\\nuseEvent(instance, instance:GetPropertyChangedSignal(\\"Name\\"))\\n```","params":[{"name":"instance","desc":"The instance that has the event you want to connect to","lua_type":"Instance"},{"name":"event","desc":"The name of or actual event that you want to connect to","lua_type":"string | RBXScriptSignal"}],"returns":[],"function_type":"static","source":{"line":75,"path":"lib/hooks/useEvent.lua"}},{"name":"useThrottle","desc":":::info Topologically-aware function\\nThis function is only usable if called within the context of [`Loop:begin`](/api/Loop#begin).\\n:::\\n\\nUtility for easy time-based throttling.\\n\\nAccepts a duration, and returns `true` if it has been that long since the last time this function returned `true`.\\nAlways returns `true` the first time.\\n\\nThis function returns unique results keyed by script and line number. Additionally, uniqueness can be keyed by a\\nunique value, which is passed as a second parameter. This is useful when iterating over a query result, as you can\\nthrottle doing something to each entity individually.\\n\\n```lua\\nif useThrottle(1) then -- Keyed by script and line number only\\n\\tprint(\\"only prints every second\\")\\nend\\n\\nfor id, enemy in world:query(Enemy) do\\n\\tif useThrottle(5, id) then -- Keyed by script, line number, and the entity id\\n\\t\\tprint(\\"Recalculate target...\\")\\n\\tend\\nend\\n```","params":[{"name":"seconds","desc":"The number of seconds to throttle for","lua_type":"number"},{"name":"discriminator?","desc":"A unique value to additionally key by","lua_type":"any"}],"returns":[],"function_type":"static","source":{"line":39,"path":"lib/hooks/useThrottle.lua"}},{"name":"component","desc":"Creates a new type of component. Call the component as a function to create an instance of that component.\\n\\n```lua\\n-- Component:\\nlocal MyComponent = Matter.component(\\"My component\\")\\n\\n-- component instance:\\nlocal myComponentInstance = MyComponent({\\n\\tsome = \\"data\\"\\n})\\n```","params":[{"name":"name?","desc":"Optional name for debugging purposes","lua_type":"string"}],"returns":[{"desc":"Your new type of component","lua_type":"Component"}],"function_type":"static","source":{"line":44,"path":"lib/init.lua"}},{"name":"useHookState","desc":":::tip\\n**Don\'t use this function directly in your systems.**\\n\\nThis function is used for implementing your own topologically-aware functions. It should not be used in your\\nsystems directly. You should use this function to implement your own utilities, similar to `useEvent` and\\n`useThrottle`.\\n:::\\n\\n`useHookState` does one thing: it returns a table. An empty, pristine table. Here\'s the cool thing though:\\nit always returns the *same* table, based on the script and line where *your function* (the function calling\\n`useHookState`) was called.\\n\\n### Uniqueness\\n\\nIf your function is called multiple times from the same line, perhaps within a loop, the default behavior of\\n`useHookState` is to uniquely identify these by call count, and will return a unique table for each call.\\n\\nHowever, you can override this behavior: you can choose to key by any other value. This means that in addition to\\nscript and line number, the storage will also only return the same table if the unique value (otherwise known as the\\n\\"discriminator\\") is the same.\\n\\n### Cleaning up\\nAs a second optional parameter, you can pass a function that is automatically invoked when your storage is about\\nto be cleaned up. This happens when your function (and by extension, `useHookState`) ceases to be called again\\nnext frame (keyed by script, line number, and discriminator).\\n\\nYour cleanup callback is passed the storage table that\'s about to be cleaned up. You can then perform cleanup work,\\nlike disconnecting events.\\n\\n*Or*, you could return `true`, and abort cleaning up altogether. If you abort cleanup, your storage will stick\\naround another frame (even if your function wasn\'t called again). This can be used when you know that the user will\\n(or might) eventually call your function again, even if they didn\'t this frame. (For example, caching a value for\\na number of seconds).\\n\\nIf cleanup is aborted, your cleanup function will continue to be called every frame, until you don\'t abort cleanup,\\nor the user actually calls your function again.\\n\\n### Example: useThrottle\\n\\nThis is the entire implementation of the built-in `useThrottle` function:\\n\\n```lua\\nlocal function cleanup(storage)\\n\\treturn os.clock() < storage.expiry\\nend\\n\\nlocal function useThrottle(seconds, discriminator)\\n\\tlocal storage = useHookState(discriminator, cleanup)\\n\\n\\tif storage.time == nil or os.clock() - storage.time >= seconds then\\n\\t\\tstorage.time = os.clock()\\n\\t\\tstorage.expiry = os.clock() + seconds\\n\\t\\treturn true\\n\\tend\\n\\n\\treturn false\\nend\\n```\\n\\nA lot of talk for something so simple, right?","params":[{"name":"discriminator?","desc":"A unique value to additionally key by","lua_type":"any"},{"name":"cleanupCallback","desc":"A function to run when the storage for this hook is cleaned up","lua_type":"(storage: {}) -> boolean?"}],"returns":[],"function_type":"static","source":{"line":111,"path":"lib/TopoRuntime.lua"}}],"properties":[{"name":"World","desc":"","lua_type":"World","source":{"line":11,"path":"lib/init.lua"}},{"name":"Loop","desc":"","lua_type":"Loop","source":{"line":16,"path":"lib/init.lua"}},{"name":"None","desc":"A value should be interpreted as nil when merging dictionaries.\\n\\n`Matter.None` is used by [`Component:patch`](/api/Component#patch).","lua_type":"None","source":{"line":25,"path":"lib/init.lua"}}],"types":[],"name":"Matter","desc":"Matter. It\'s what everything is made out of.","source":{"line":6,"path":"lib/init.lua"}}')}}]);