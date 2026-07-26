package com.eia.racingleague.config;

import com.eia.racingleague.model.Role;
import com.eia.racingleague.model.RoleName;
import com.eia.racingleague.model.User;
import com.eia.racingleague.repository.RoleRepository;
import com.eia.racingleague.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.eia.racingleague.model.Competitor;
import com.eia.racingleague.model.CompetitorStatus;
import com.eia.racingleague.model.CompetitorType;
import com.eia.racingleague.repository.CompetitorRepository;
import com.eia.racingleague.model.Team;
import com.eia.racingleague.model.TeamMember;
import com.eia.racingleague.model.TeamStatus;
import com.eia.racingleague.repository.TeamMemberRepository;
import com.eia.racingleague.repository.TeamRepository;
import com.eia.racingleague.model.Race;
import com.eia.racingleague.model.RaceStatus;
import com.eia.racingleague.model.RaceType;
import com.eia.racingleague.repository.RaceRepository;
import com.eia.racingleague.model.RaceRegistration;
import com.eia.racingleague.model.RegistrationStatus;
import com.eia.racingleague.repository.RaceRegistrationRepository;
import com.eia.racingleague.model.RaceResult;
import com.eia.racingleague.model.ResultStatus;
import com.eia.racingleague.repository.RaceResultRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Set;


@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CompetitorRepository competitorRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final RaceRepository raceRepository;
    private final RaceRegistrationRepository raceRegistrationRepository;
    private final RaceResultRepository raceResultRepository;

    @Override
    @Transactional
    public void run(String... args) {
        Role admin = roleRepository.findByName(RoleName.ADMINISTRATOR)
                .orElseGet(() -> roleRepository.save(new Role(null, RoleName.ADMINISTRATOR)));
        Role organizer = roleRepository.findByName(RoleName.RACE_ORGANIZER)
                .orElseGet(() -> roleRepository.save(new Role(null, RoleName.RACE_ORGANIZER)));
        Role viewer = roleRepository.findByName(RoleName.VIEWER)
                .orElseGet(() -> roleRepository.save(new Role(null, RoleName.VIEWER)));

        createUserIfMissing("admin", "admin@racingleague.eia", "Admin123!", "Administrador General", Set.of(admin));
        createUserIfMissing("organizer", "organizer@racingleague.eia", "Organizer123!", "Organizador de Carreras", Set.of(organizer));
        createUserIfMissing("viewer", "viewer@racingleague.eia", "Viewer123!", "Usuario Espectador", Set.of(viewer));
        if (competitorRepository.count() == 0) {
            seedCompetitor("Gimli Ironforge", "gimli", CompetitorType.DWARF, 85.0, 1.40, "Erebor");
            seedCompetitor("Thrain Stonebeard", "thrain", CompetitorType.DWARF, 90.0, 1.35, "Erebor");
            seedCompetitor("Balin Hammerfist", "balin", CompetitorType.DWARF, 88.0, 1.38, "Moria");
            seedCompetitor("Dwalin Battleaxe", "dwalin", CompetitorType.DWARF, 95.0, 1.42, "Moria");
            seedCompetitor("Nori Quickfoot", "nori", CompetitorType.DWARF, 78.0, 1.33, "Ered Luin");

            seedCompetitor("Sahara Storm", "sahara", CompetitorType.CAMEL, 550.0, 1.85, "Sahara Desert");
            seedCompetitor("Dune Runner", "dune", CompetitorType.CAMEL, 600.0, 1.90, "Gobi Desert");

            seedCompetitor("Marco Veloz", "marco", CompetitorType.MEDIUM, 70.0, 1.70, "Medellín");
            seedCompetitor("Lucia Rapida", "lucia", CompetitorType.MEDIUM, 65.0, 1.65, "Bogotá");
        }
        if (teamRepository.count() == 0) {
            Team erebor = teamRepository.save(Team.builder()
                    .name("Erebor Racers")
                    .description("Equipo de enanos veloces de la Montaña Solitaria")
                    .coachName("Thorin Oakenshield")
                    .status(TeamStatus.ACTIVE)
                    .build());

            Team desertStorm = teamRepository.save(Team.builder()
                    .name("Desert Storm")
                    .description("Equipo de camellos del desierto")
                    .coachName("Ahmed Al-Rashid")
                    .status(TeamStatus.ACTIVE)
                    .build());

            competitorRepository.findByNickname("gimli").ifPresent(c ->
                    teamMemberRepository.save(TeamMember.builder().team(erebor).competitor(c).active(true).build()));
            competitorRepository.findByNickname("thrain").ifPresent(c ->
                    teamMemberRepository.save(TeamMember.builder().team(erebor).competitor(c).active(true).build()));

            competitorRepository.findByNickname("sahara").ifPresent(c ->
                    teamMemberRepository.save(TeamMember.builder().team(desertStorm).competitor(c).active(true).build()));
            competitorRepository.findByNickname("dune").ifPresent(c ->
                    teamMemberRepository.save(TeamMember.builder().team(desertStorm).competitor(c).active(true).build()));
        }if (raceRepository.count() == 0) {
            raceRepository.save(Race.builder()
                    .name("Copa Erebor de Velocidad")
                    .description("Carrera clásica de enanos por los túneles de la montaña")
                    .scheduledAt(java.time.LocalDateTime.now().plusDays(10))
                    .startLocation("Puerta Principal")
                    .finishLocation("Salón del Trono")
                    .distanceMeters(500.0)
                    .maxParticipants(10)
                    .raceType(RaceType.INDIVIDUAL)
                    .organizer("organizer")
                    .registrationDeadline(java.time.LocalDateTime.now().plusDays(8))
                    .status(RaceStatus.DRAFT)
                    .build());

            raceRepository.save(Race.builder()
                    .name("Gran Travesía del Desierto")
                    .description("Carrera de resistencia para camellos")
                    .scheduledAt(java.time.LocalDateTime.now().plusDays(5))
                    .startLocation("Oasis Norte")
                    .finishLocation("Oasis Sur")
                    .distanceMeters(5000.0)
                    .maxParticipants(6)
                    .raceType(RaceType.TEAM)
                    .organizer("organizer")
                    .registrationDeadline(java.time.LocalDateTime.now().plusDays(3))
                    .status(RaceStatus.OPEN_FOR_REGISTRATION)
                    .build());

            raceRepository.save(Race.builder()
                    .name("Maratón Inaugural EIA")
                    .description("Primera carrera mixta de la liga, ya finalizada")
                    .scheduledAt(java.time.LocalDateTime.now().minusDays(15))
                    .startLocation("Campus EIA")
                    .finishLocation("Parque Principal")
                    .distanceMeters(3000.0)
                    .maxParticipants(8)
                    .raceType(RaceType.MIXED)
                    .organizer("organizer")
                    .registrationDeadline(java.time.LocalDateTime.now().minusDays(17))
                    .status(RaceStatus.COMPLETED)
                    .build());
        }if (raceRegistrationRepository.count() == 0) {
            raceRepository.findAll().stream()
                    .filter(r -> r.getName().equals("Maratón Inaugural EIA"))
                    .findFirst()
                    .ifPresent(completedRace -> {
                        competitorRepository.findByNickname("gimli").ifPresent(c ->
                                raceRegistrationRepository.save(RaceRegistration.builder()
                                        .race(completedRace).competitor(c)
                                        .status(RegistrationStatus.APPROVED)
                                        .startingPosition(1)
                                        .registeredBy("organizer")
                                        .build()));
                        competitorRepository.findByNickname("sahara").ifPresent(c ->
                                raceRegistrationRepository.save(RaceRegistration.builder()
                                        .race(completedRace).competitor(c)
                                        .status(RegistrationStatus.APPROVED)
                                        .startingPosition(2)
                                        .registeredBy("organizer")
                                        .build()));
                        competitorRepository.findByNickname("marco").ifPresent(c ->
                                raceRegistrationRepository.save(RaceRegistration.builder()
                                        .race(completedRace).competitor(c)
                                        .status(RegistrationStatus.APPROVED)
                                        .startingPosition(3)
                                        .registeredBy("organizer")
                                        .build()));
                    });
        }if (raceResultRepository.count() == 0) {

            var registrations = raceRegistrationRepository.findAllWithRaceAndCompetitor();

            for (RaceRegistration reg : registrations) {

                if (!reg.getRace().getName().equals("Maratón Inaugural EIA")) {
                    continue;
                }

                int position;

                switch (reg.getStartingPosition()) {
                    case 1 -> position = 1;
                    case 2 -> position = 2;
                    default -> position = 3;
                }

                double time = 300.0 + (position * 45);

                RaceResult result = RaceResult.builder()
                        .race(reg.getRace())
                        .registration(reg)
                        .startingPosition(reg.getStartingPosition())
                        .finalPosition(position)
                        .completionTimeSeconds(time)
                        .penaltyTimeSeconds(0.0)
                        .status(ResultStatus.FINISHED)
                        .recordedBy("organizer")
                        .build();

                raceResultRepository.save(result);


                Competitor c = reg.getCompetitor();

                if (position == 1) {
                    c.setVictories(c.getVictories() + 1);
                } else {
                    c.setDefeats(c.getDefeats() + 1);
                }

                c.setRacesCompleted(c.getRacesCompleted() + 1);

                competitorRepository.save(c);
            }
        }
    }

    private void createUserIfMissing(String username, String email, String rawPassword, String fullName, Set<Role> roles) {
        if (userRepository.existsByUsername(username)) return;

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .fullName(fullName)
                .enabled(true)
                .roles(roles)
                .build();

        userRepository.save(user);
    }

    private void seedCompetitor(String name, String nickname, CompetitorType type,
                                double weight, double height, String country) {
        Competitor competitor = Competitor.builder()
                .name(name)
                .nickname(nickname)
                .competitorType(type)
                .weight(weight)
                .height(height)
                .countryOfOrigin(country)
                .status(CompetitorStatus.ACTIVE)
                .build();
        competitorRepository.save(competitor);
    }
}