#!/usr/bin/env python3
"""
Python Reference Test: Double Integrator (simpler than harmonic oscillator)
"""

import numpy as np
import json
from pathsim import Simulation, Connection
from pathsim.blocks import Constant, Integrator, Scope
from pathsim.solvers import SSPRK22

# Create blocks - double integrator with constant acceleration
accel = Constant(0.1)  # Constant acceleration
vel_int = Integrator(0.0)  # Velocity integrator
pos_int = Integrator(1.0)  # Position integrator
scope = Scope(labels=["position", "velocity"])

# Create simulation
sim = Simulation(
    blocks=[accel, vel_int, pos_int, scope],
    connections=[
        Connection(accel[0], vel_int[0]),
        Connection(vel_int[0], pos_int[0]),
        Connection(pos_int[0], scope[0]),
        Connection(vel_int[0], scope[1])
    ],
    dt=0.01,
    Solver=SSPRK22,
    log=False
)

# Run simulation
sim.run(10.0, reset=True)

# Extract data
time_data, data = scope.read()
time_data = time_data.tolist()
position_data = data[0].tolist()
velocity_data = data[1].tolist()

# Save to JSON
output = {
    "test": "double_integrator",
    "parameters": {
        "acceleration": 0.1,
        "initial_velocity": 0.0,
        "initial_position": 1.0,
        "dt": 0.01,
        "duration": 10.0,
        "solver": "SSPRK22"
    },
    "results": {
        "time": time_data,
        "position": position_data,
        "velocity": velocity_data,
        "num_points": len(time_data)
    }
}

with open("test_double_integrator_python.json", "w") as f:
    json.dump(output, f, indent=2)

print("Python double integrator test completed:")
print(f"  Time points: {len(time_data)}")
print(f"  Final position: {position_data[-1]:.6f}")
print(f"  Final velocity: {velocity_data[-1]:.6f}")
print(f"  Expected velocity: {0.1 * 10:.6f}")
print(f"  Expected position: {1.0 + 0.5 * 0.1 * 10**2:.6f}")
