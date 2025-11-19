#!/usr/bin/env python3
"""
Python Reference Test: Harmonic Oscillator
Generates reference output for JavaScript comparison
"""

import numpy as np
import json
from pathsim import Simulation, Connection
from pathsim.blocks import Integrator, Amplifier, Adder, Scope
from pathsim.solvers import SSPRK22

# System parameters
initial_position = 1.0
initial_velocity = 0.0
spring_constant = -1.0
damping_coeff = -0.1

# Create blocks
pos_integrator = Integrator(initial_position)
vel_integrator = Integrator(initial_velocity)
spring_force = Amplifier(spring_constant)
damping_force = Amplifier(damping_coeff)
force_adder = Adder("++")
scope = Scope(labels=["position", "velocity"])

# Create simulation
sim = Simulation(
    blocks=[pos_integrator, vel_integrator, spring_force, damping_force, force_adder, scope],
    connections=[
        Connection(pos_integrator[0], spring_force[0]),
        Connection(pos_integrator[0], scope[0]),
        Connection(vel_integrator[0], pos_integrator[0]),
        Connection(vel_integrator[0], damping_force[0]),
        Connection(vel_integrator[0], scope[1]),
        Connection(spring_force[0], force_adder[0]),
        Connection(damping_force[0], force_adder[1]),
        Connection(force_adder[0], vel_integrator[0])
    ],
    dt=0.01,
    Solver=SSPRK22,
    log=False
)

# Run simulation
sim.run(20.0, reset=True)

# Extract data
time_data, data = scope.read()
time_data = time_data.tolist()
position_data = data[0].tolist()
velocity_data = data[1].tolist()

# Save to JSON for JavaScript comparison
output = {
    "test": "harmonic_oscillator",
    "parameters": {
        "initial_position": initial_position,
        "initial_velocity": initial_velocity,
        "spring_constant": spring_constant,
        "damping_coeff": damping_coeff,
        "dt": 0.01,
        "duration": 20.0,
        "solver": "SSPRK22"
    },
    "results": {
        "time": time_data,
        "position": position_data,
        "velocity": velocity_data,
        "num_points": len(time_data)
    }
}

with open("test_harmonic_oscillator_python.json", "w") as f:
    json.dump(output, f, indent=2)

print("Python reference test completed:")
print(f"  Time points: {len(time_data)}")
print(f"  Initial position: {position_data[0]:.6f}")
print(f"  Final position: {position_data[-1]:.6f}")
print(f"  Position range: [{min(position_data):.6f}, {max(position_data):.6f}]")
print(f"  Velocity range: [{min(velocity_data):.6f}, {max(velocity_data):.6f}]")
