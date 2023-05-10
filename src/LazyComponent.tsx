import React, { useState } from 'react';

const LazyComponent = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      I am a lazy component
      <p>Count: {count}</p>
      <button onClick={() => setCount(p => p + 1)}>Increment</button>
    </div>
  )
}

export default LazyComponent;
