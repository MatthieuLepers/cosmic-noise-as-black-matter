# Mathematical Model of Dark Matter Based on 3D Cosmic Noise

## Working Hypothesis

Dark matter could be modeled not as actual "matter", but as irregularities (or "fragilities") in the very structure of space-time. These irregularities would favor the accumulation of visible matter, thus explaining the formation of large cosmological structures.

## 3D Cosmic Noise Model

To represent these irregularities, we use a three-dimensional noise model, inspired by Perlin noise.

### 1. 3D Perlin Noise Function

Perlin noise in 3D is a sum of components at different frequencies and amplitudes:

\[
P(x, y, z) = \sum_{i=1}^{n} \frac{A_i}{2^i} \cos\left(2\pi f_i (x + y + z)\right)
\]

Where:
- \( A_i \) is the amplitude at scale \( i \),
- \( f_i \) is the frequency at scale \( i \),
- \( n \) is the number of detail levels,
- \( (x, y, z) \) are the three-dimensional coordinates.

### 2. Adaptation to Cosmic Noise

To model dark matter as smooth gravitational variations, we propose a variant using the \( \tanh \) function to smooth densities:

\[
\rho(x, y, z) = \sum_{i=1}^{n} \frac{A_i}{2^i} \cdot \tanh\left(2\pi f_i (x + y + z)\right)
\]

Where:
- \( \rho(x, y, z) \) denotes the **effective gravitational density** at a given point,
- \( \tanh \) ensures a smooth transition between high and low density zones.

### 3. Associated Gravitational Potential

The gravitational potential \( \Phi(x, y, z) \) is related to density through Poisson's equation:

\[
\nabla^2 \Phi(x, y, z) = 4 \pi G \rho(x, y, z)
\]

Where:
- \( \nabla^2 \) is the three-dimensional Laplacian operator,
- \( G \) is the gravitational constant,
- \( \rho(x, y, z) \) is the effective density of cosmic noise.

This means that the noise generated in space determines the shape of the gravitational potential, and thus how visible matter is attracted or dispersed.

### 4. Model Properties

- **Three-dimensional space**: the noise is generated in 3D to match our physical perception.
- **Multi-scale**: different structure sizes are represented through multiple frequencies.
- **Empty and full regions**: cosmic voids correspond to minima of the noise field.
- **Gravitational dynamics**: the potential \( \Phi \) explains the dynamics of galaxies and clusters.

### 5. Simulation Perspectives

- **WebGPU implementation**: generate 3D Perlin noise on GPU to simulate cosmic density.
- **Potential resolution**: numerically integrate Poisson's equation to obtain \( \Phi \).
- **Dynamic modulation**: refine frequencies and amplitudes to better match astronomical observations.

---

**Next step:** Creation of a cosmic noise generation algorithm and potential calculation on 3D grid.

